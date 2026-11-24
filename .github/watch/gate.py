"""Read the PR queue, constrain the patch, and publish only validated data."""
import argparse
from datetime import date, datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from zoneinfo import ZoneInfo

ALLOWED = {
    'data/resources.yml',
    'data/candidates.yml',
    'data/weekly-picks.yml',
    'CHANGELOG.md',
    'docs/research-log.md',
}
DEFER_OPEN = False
REPO = os.environ.get("GITHUB_REPOSITORY", "")


def git(*args, **kwargs):
    return subprocess.check_output(["git", *args], **kwargs)


def api(endpoint, *, pages=False):
    options = ["--paginate", "--slurp"] if pages else []
    response = json.loads(subprocess.check_output(["gh", "api", *options, f"repos/{REPO}/{endpoint}"]))
    return [item for page in response for item in page] if pages else response


def output(name, value):
    with open(os.environ["GITHUB_OUTPUT"], "a") as file:
        print(f"{name}={value}", file=file)


def note(message):
    print(message)
    with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as file:
        print(message, file=file)


def pr_for_week(pr, week, branch):
    ref = pr["head"]["ref"]
    title = pr["title"]
    if ref == branch and pr["head"].get("repo") and pr["head"]["repo"]["full_name"] == REPO:
        return True
    if not re.search(r"weekly|週次|今週", ref + " " + title, flags=re.I):
        return False
    # Historical weekly proposals use the edition date in the title or branch.
    dates = re.findall(r"(?<!\d)\d{4}-\d{2}-\d{2}(?!\d)", ref + " " + title)
    if not dates:
        dates = [datetime.fromisoformat(pr["created_at"].replace("Z", "+00:00")).astimezone(ZoneInfo("Asia/Tokyo")).date().isoformat()]
        # A migration PR might itself have "weekly" in its name.
        if not (ref.startswith(("weekly/", "automation/weekly-research-")) or re.search(r"^Weekly (?:research|UIAPduino|Scratch).*update", title, re.I)):
            return False
    for candidate in dates:
        try:
            if date.fromisoformat(candidate).strftime("%G-W%V") == week:
                return True
        except ValueError:
            pass
    return False


def queue(day, pending=None):
    week = date.fromisoformat(day).strftime("%G-W%V")
    branch = f"automation/weekly-research-{week}"
    prs = api("pulls?state=all&base=main&per_page=100", pages=True)
    digest = hashlib.sha256()
    context = []
    for pr in prs:
        if pr_for_week(pr, week, branch):
            return branch, None, f"同じ週の提案 #{pr['number']} を確認しました。"
        if pr["state"] != "open":
            continue
        files = api(f"pulls/{pr['number']}/files?per_page=100", pages=True)
        if len(files) >= 3000:
            raise RuntimeError(f"PR #{pr['number']} の全ファイルを確認できません。")
        changed = [f for f in files if f["filename"].startswith("data/") or f.get("previous_filename", "").startswith("data/")]
        if not changed:
            continue
        if DEFER_OPEN:
            return branch, None, f"未マージのデータ提案 #{pr['number']} を先に確認してください。"
        digest.update(f"{pr['number']}:{pr['head']['sha']}\n".encode())
        for file in changed:
            lines = [line[1:] for line in file.get("patch", "").splitlines() if line.startswith("+")]
            if len(lines) != file["additions"] or file["status"] == "renamed":
                raise RuntimeError(f"PR #{pr['number']} の追加内容を完全に照合できません。")
            context.extend(lines)
    if pending:
        pending.write_text("\n".join(context), encoding="utf-8")
    return branch, digest.hexdigest(), None


def scan():
    day = datetime.now(ZoneInfo("Asia/Tokyo")).date().isoformat()
    branch, snapshot, hold = queue(day, Path(os.environ["WATCH_PENDING"]))
    output("day", day)
    output("branch", branch)
    output("base", git("rev-parse", "HEAD", text=True).strip())
    output("ready", str(hold is None).lower())
    if hold:
        note(hold)
    else:
        output("snapshot", snapshot)
        note(f"{day} JST、対象main {git('rev-parse', '--short', 'HEAD', text=True).strip()}。未マージPRの照合完了。")


def check_paths(staged=False):
    opts = ["--cached"] if staged else []
    raw = git("diff", *opts, "--raw", "--no-abbrev", "--no-renames", "-z").split(b"\0")
    for metadata, path in zip(raw[0::2], raw[1::2]):
        old, new, _, _, status = metadata.decode().split()
        if old != ":100644" or new != "100644" or status != "M" or os.fsdecode(path) not in ALLOWED:
            raise RuntimeError("許可リスト外の変更・モード変更・追加削除を検出しました。")
    return bool(raw[0])


def pack(path):
    if git("ls-files", "--others", "--exclude-standard", "-z"):
        raise RuntimeError("想定外の新規ファイルを検出しました。")
    # The pilot overlay is staged in the local index before research begins.
    # All subsequent edits must be regular-file edits in the catalog allowlist.
    changed = check_paths()
    if not changed:
        output("changed", "false")
        note("検証済みの掲載差分は0件です。コミット・PRは作成しません。")
        return
    patch = git("diff", "--full-index", "--no-ext-diff", "--no-textconv", "--", *sorted(ALLOWED))
    if not patch or len(patch) > 2_000_000:
        raise RuntimeError("差分のサイズが試験運用の上限を超えました。")
    path.write_bytes(patch)
    output("changed", "true")
    output("sha", hashlib.sha256(patch).hexdigest())
    note("検証済みのデータ差分を作成しました。")


def publish(path):
    branch, snapshot, hold = queue(os.environ["WATCH_DATE"])
    if hold:
        note(hold)
        return
    if snapshot != os.environ["WATCH_SNAPSHOT"]:
        raise RuntimeError("調査後に別のデータPRが更新されました。再実行してください。")
    base = os.environ["WATCH_BASE"]
    if api("git/ref/heads/main")["object"]["sha"] != base:
        raise RuntimeError("調査後にmainが進みました。最新mainで再実行してください。")
    if git("rev-parse", "HEAD", text=True).strip() != base or hashlib.sha256(path.read_bytes()).hexdigest() != os.environ["WATCH_SHA"]:
        raise RuntimeError("検証時のmainまたは差分ハッシュと一致しません。")
    git("apply", "--index", "--whitespace=nowarn", str(path))
    if not check_paths(staged=True):
        raise RuntimeError("空の差分です。")
    git("config", "user.name", "github-actions[bot]")
    git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
    git("switch", "-c", branch)
    git("commit", "-m", f"Weekly research update {os.environ['WATCH_DATE']}")
    auth = ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential"]
    remote = git(*auth, "ls-remote", "--heads", "origin", f"refs/heads/{branch}", text=True)
    if remote:
        # Retry after a successful push and a failed PR request. Never overwrite.
        git(*auth, "fetch", "--no-tags", "origin", f"refs/heads/{branch}")
        if git("rev-parse", "HEAD^{tree}") != git("rev-parse", "FETCH_HEAD^{tree}") or git("rev-parse", "FETCH_HEAD^") != git("rev-parse", base):
            raise RuntimeError("同名ブランチに異なる変更があります。既存提案の確認が必要です。")
    else:
        git(*auth, "push", "origin", f"HEAD:refs/heads/{branch}")
    run = f"{os.environ['GITHUB_SERVER_URL']}/{REPO}/actions/runs/{os.environ['GITHUB_RUN_ID']}"
    url = subprocess.check_output(["gh", "pr", "create", "--repo", REPO, "--base", "main", "--head", branch,
        "--title", f"Weekly research update {os.environ['WATCH_DATE']}",
        "--body", f"週次調査の検証済み差分です。PMOが出典・重複・公開品質を確認し、利用者がマージを判断してください。\n\n[実行ログと検証結果]({run})"], text=True).strip()
    note(f"レビュー待ちのPRを作成しました。 {url}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["scan", "pack", "publish"])
    parser.add_argument("path", nargs="?", type=Path)
    args = parser.parse_args()
    if args.mode == "scan":
        scan()
    elif args.mode == "pack":
        pack(args.path)
    else:
        publish(args.path)
