"""Ground public research without transferring repository contents to the model."""
import json
import os
import subprocess
from urllib.parse import urlsplit
from pathlib import Path

from research import research

DOMAINS = [
    "www.uiap.jp", "github.com", "zenn.dev", "qiita.com", "note.com",
    "protopedia.net", "news.coderdojo.jp", "kame404.com", "www.jh4vaj.com",
    "www.elecrow.com", "www.switch-science.com", "uiap.booth.pm",
    "utakamo.com", "fabscene.com", "logiclab.blog.jp", "www.ipc.shimane-u.ac.jp",
    "nrfconnectdocs.nordicsemi.com", "btoshop.jp", "youtube.com", "x.com",
]
fields = ("summary_ja", "reason_ja", "region", "language", "categories", "author", "published_at")
prompt = Path(__file__).with_name("research-instructions.md").read_text()
# Reserve one slot for comparing a saved candidate against newly discovered sources.
# The selector reads local data; only a public source page travels to Gemini.
candidate = subprocess.check_output(
    ["node", ".github/watch/candidate.mjs"], text=True
).strip()
seeds = [
    ("https://www.uiap.jp/uiapduino/", r"^/uiapduino/.+"),
    ("https://www.uiap.jp/event", r"^/event/.+"),
    ("https://zenn.dev/topics/uiapduino/feed", r"/articles/"),
    ("https://qiita.com/tags/uiapduino/feed", r"/items/"),
    ("https://note.com/papico_2020/rss", r"/n/n"),
    ("https://github.com/topics/uiapduino", r"^/(?!topics/|collections/|features/|sponsors/|orgs/|marketplace/|enterprise/|solutions/|resources/)[A-Za-z0-9.-]+/[A-Za-z0-9._-]+$"),
    ("https://protopedia.net/search?keyword=UIAPduino", r"^/prototype/[0-9]+"),
]
if candidate and urlsplit(candidate).hostname in DOMAINS:
    # No link expansion for the candidate itself.
    seeds.append((candidate, r"(?!)"))
records = research(prompt, domains=DOMAINS, fields=fields, seeds=seeds)
Path(os.environ["WATCH_RECORDS"]).write_text(json.dumps(records, ensure_ascii=False))
