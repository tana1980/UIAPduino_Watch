# UIAPduino Watch

UIAPduino Community Links, Projects & Resources

**UIAPduino Watchは非公式のコミュニティ情報ポータルです。UIAP公式とは関係ありません。**

国内外のUIAPduinoの記事、作品、教材、公式資料、GitHubプロジェクト、販売先を、日本語の紹介と分類で探せる静的サイトです。独自の文字・回路モチーフを使用し、UIAPのロゴや製品画像をブランドとして流用しません。

## 開発

Node.js 24（`.node-version`）、npmを使用します。秘密鍵・外部データベースは不要です。

```sh
export ASTRO_TELEMETRY_DISABLED=1
npm ci
npm run validate
npm test
npm run build
npm run dev
```

Astroのテレメトリを停止する場合は `ASTRO_TELEMETRY_DISABLED=1` を環境変数に設定してください。書き込み場所が制限されたクラウドでは `npm ci --cache /workspace/.npm-cache` を使用します。環境はすでにタスクごとに分離されています。既存のチェックアウトを使い、依頼なしにGit worktreeを作成する必要はありません。

`npm run test:browser` はビルド済みサイトを一時起動し、3ページをスマートフォン・デスクトップ幅で検証します。地域・カテゴリ・言語・製品・日本語検索、URL保持、条件クリア、キーボード、JavaScript無効時の全件表示、WCAG A/AAチェック、パス配下のCSS/JS読み込みを確認します。

ローカルの Chromium `/usr/bin/chromium`、または `CHROMIUM_PATH` を使用できます。それ以外は `npx playwright install --with-deps chromium` でブラウザを用意してください。

## データ構造

- `data/resources.yml`: 元ページ確認済み情報の正本。サイトは `status: active` のみを表示。
- `data/candidates.yml`: 未採用の確認済み情報の `resource_id`、候補入り日、推薦理由。本文を複製せず正本を参照。
- `data/weekly-picks.yml`: 過去・最新の推薦。日付、`kind: initial | weekly`、説明、リソースID。
- `docs/research-log.md`: 検索方法、確認範囲、見送り理由、未確認の発見先。
- `docs/initial-report.md`: 初回収録件数・検証結果・公開状況。

リソースの必須キーは `id`, `title`, `url`, `source`, `author`, `region`, `language`, `categories`, `products`, `published_at`, `discovered_at`, `last_checked_at`, `summary_ja`, `tags`, `official`, `status`。加えて `verification` に確認URL・本文確認メモ・取得内容のSHA-256を記録します。このハッシュは調査時の記録であり、将来の外部ページに一致を要求するものではありません。

`author` と `published_at` が不明なら `null`、製品未確認なら `[]`、言語未確認なら `unknown`。公開日と更新日は分け、リポジトリ作成日や最終コミットを記事の公開日として使いません。取得日を公開日として補完しません。

地域は `Japan | Overseas | Global`。Japanは日本語の国内向け資料、Overseasは海外発の情報・海外販売先、Globalは国を特定しない情報・多言語資料。英語だけを根拠に作者の所在国を推測しません。

カテゴリは `Official, Documentation, News, Tutorial, Project, GitHub, Article, SNS, Video, Event, Shop, Hardware, Library, Tool, Education`。複数指定できます。

## 情報収集・掲載基準

[UIAP公式シリーズ紹介](https://www.uiap.jp/uiapduino/)を製品構成とOfficial判定の基準とします。公式サイトから関係を確認できる資料・公式GitHub・直営ショップをOfficialにし、紹介された第三者の作品・取扱店はCommunityのままにします。

1. 検索で見つけたら元ページを読み、UIAPduinoとの直接の関係と読者への価値を確認。
2. URL・IDを既存データと照合。末尾スラッシュ、フラグメント、追跡パラメータの違いで件数を増やさない。
3. 対象読者が分かる日本語の短い説明を独自に作成。本文・画像を転載しない。
4. 著者、製品、日付が分からなければ不明のまま残す。
5. 価格や在庫を恒久的事実として保存しない。購入時の販売先を案内する。
6. 403、認証画面、スニペットのみ、空のREADMEは掲載根拠にしない。調査記録へ保留。

初回は3件上限を設けません。一般検索・日本語／英語・製品名・サービス内検索・参照リンクを組み合わせ、新規の有用情報が出なくなったかを判断します。アクセス制限が残る場合は「調査完了」とせず、未確認の範囲を明記します。

## Weekly Picksと更新

初回は代表的な情報を `kind: initial` で数件紹介。その後の `kind: weekly` は必ず3件にします。今週発見した情報だけでなく `candidates.yml` の全候補を比較し、技術的価値、分かりやすさ、対象読者・カテゴリ・地域・製品の多様性から選びます。

推薦に採用したIDは候補リストから除き、過去の推薦記録は残します。未採用情報を捨てません。推薦のない週は新しい版を捏造せず、最新の確認済み版を表示します。更新は人による元ページ確認とPRレビューを経ます。AIだけでリンクや事実を自動登録しません。

`check-links.yml` が毎週月曜09:00（日本時間）に外部リンクを確認してActions ArtifactにJSONを保存します。これはリンク状態の調査で、データ・確認日・推薦を勝手に変更しません。手動実行は `npm run check:links`。HEAD非対応時はGETで再確認します。403・429・5xx・タイムアウトは `needs_review`、404・410は `broken` と区別。通常はレポートを出して成功し、`npm run check:links -- --strict` は404/410で失敗します。外部サイトの一時的制限でPR CIを不安定にしません。

## 情報追加の例

```yaml
- id: example-uiapduino-project
  title: UIAPduinoの作品のタイトル
  url: https://example.com/verified-page
  source: 個人ブログ
  author: null
  region: Japan
  language: ja
  categories: [Project, Article]
  products: [UIAPduino Pro Micro CH32V003]
  published_at: null
  discovered_at: '2026-10-06'
  last_checked_at: '2026-10-06'
  summary_ja: 何を作ったのか、どの読者に役立つのかを記載。
  tags: [電子工作]
  official: false
  status: active
  verification:
    checked_url: https://example.com/verified-page
    note: 元ページの本文とUIAPduino使用を確認。
```

この例は形式説明用で、掲載データではありません。未採用なら候補に以下も追加します。

```yaml
- resource_id: example-uiapduino-project
  added_at: '2026-10-06'
  reason_ja: 配線と実装コードがあり、初心者の制作例として比較する。
```

`npm run validate && npm test && npm run build` を実行してPRを提出してください。CIはビルド、必須フィールド・形式・日付・分類・重複URL・参照整合性の検証、回帰テスト、ブラウザ検証を行います。

## 誤情報・削除依頼と貢献

Pull Request歓迎です。誤情報、著作権や掲載に関する問題、削除依頼はGitHub Issuesへ対象URLと理由を添えてお知らせください。個人情報や秘密情報は公開しないでください。元情報の訂正に合わせ、紹介文を修正・削除または `status: archived | unavailable` に変更します。外部記事・作品の権利は各著作者に帰属します。

## GitHub Pages

現在の作業先は `tana1980/info_uiapduino`、サイト・npmプロジェクト名は `uiapduino-watch` です。選択リポジトリを無断で改名せず、このリポジトリ用のパスで配信します。後から `uiapduino-watch` に移した場合も `GITHUB_REPOSITORY` からベースパスを自動算出します。

1. GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions** を設定。
2. 初回PRの内容を確認し `main` にmerge。
3. `deploy-pages.yml` が build → validate/test → upload → deploy を実行。
4. Actionsのdeployジョブが示す実際の公開URLを確認。

現在のリポジトリでの公開予定URLは `https://tana1980.github.io/info_uiapduino/`。`uiapduino-watch` に移した場合は `https://tana1980.github.io/uiapduino-watch/`。成功したデプロイを確認するまで「公開済み」とはしません。

`astro.config.mjs` はproject pagesのベースパスを自動設定。ルート公開・独自ドメインでは `BASE_PATH=/` と `SITE_URL=https://your-domain.example` をビルド時に設定してください。全ての内部リンクとfaviconはベースパスを使用し、CSS/JSはAstroが出力します。
