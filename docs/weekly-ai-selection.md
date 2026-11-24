# 週次調査の実行方式と選定記録

2026年11月24日（日本時間）。週次更新では、発行者の公開資料をGitHub Actionsが直接収集し、候補の読み取りと日本語編集にGemini Developer APIを使う。候補Bと同じAPIキー認証・非対話の構成を採用し、実装からは公式RESTの `generateContent` を呼ぶ。既存のデータモデルへの反映、重複確認、Git操作にはリポジトリ側のコードを使う。APIモデルは `gemini-3.5-flash-lite` に固定する。[モデル仕様](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite) ／ [REST仕様](https://aistudio.google.com/api-reference/generate-content/generate-content)

| 選択肢 | 認証・無人実行 | 調査、出力、編集 | 週次運用上の判断 |
| --- | --- | --- | --- |
| A. Antigravity CLI | `agy -p`、JSON出力あり。APIキー利用は設定ファイルの `modelProvider: "gemini"` と `GEMINI_API_KEY` の両方が必要。この経路はCLI v1.1.13で追加。個人OAuthには初期ログインが必要 | エージェントがWeb閲覧・ワークスペース編集・コマンド実行を行える。ツール許可やヘッドレス実行時の承認動作の設定が必要 | 調査の手順・呼出回数が可変。認証方式により利用枠が変わり、APIキー方式のモデル利用はGemini API課金。ファイル編集権限を委ねる利点が小さい。[認証](https://antigravity.google/docs/cli/install/) ／ [非対話モード](https://antigravity.google/docs/cli/headless/) ／ [変更記録](https://antigravity.google/docs/changelog?tab=cli) |
| B. gemini-api CLI v0.5.0 | 単体Goバイナリ。環境変数 `GEMINI_API_KEY`、非対話モード、単発リクエストに対応 | Python/Nodeから標準入出力と終了コードで連携できる。生成内容のスキーマは `response_format.schema`、CLI応答全体のJSON化は `--output-format json`。Deep Researchは別の非同期エージェントとして起動・ポーリング可能 | 絞ったリクエストを送りやすい。公式はbetaとして特定版固定を推奨。GitHubへの更新は別の処理。今回必要な単発の編集処理はRESTだけで完結する。[固定版README](https://github.com/google-gemini/gemini-api-cli/blob/v0.5.0/README.md) ／ [固定版ソース](https://github.com/google-gemini/gemini-api-cli/blob/v0.5.0/internal/cli/agent/intent_generate.go) |
| 参考. run-gemini-cli | GitHub Actions向け。APIキーまたはGoogle CloudのWorkload Identity Federationなどを選択できる | Gemini CLIのエージェントを起動する。モデル・プロンプト・設定・CLI版を渡せる | Actionと内部にインストールするCLIの両方を固定する必要がある。CLI版の既定値は latest。週次更新のデータ検証は別途必要。[Action定義](https://github.com/google-github-actions/run-gemini-cli/blob/main/action.yml) ／ [説明](https://github.com/google-github-actions/run-gemini-cli) |

## CLIの実機確認

公式タグ `v0.5.0` のコミットは `6f2da79f0590acb39f3414ed8502f49859d75e4a`。公式GitHub ReleasesでLinux x86-64アーカイブのSHA-256 `fce229dd482ec1caff15cd147a293513ffb5a52390394e52136f85b4a497c742` を照合した。実行したバイナリは `gemini-api version` で0.5.0を返し、`gemini-api generate --schema` が成功した。次の例ではHTTP通信を行わず、API版、指定モデル、ストリーム無効、保存無効、応答スキーマを組み立てられた。実認証、生成料金、実行時間の計測は各リポジトリの手動実行で確認する。[リリース](https://github.com/google-gemini/gemini-api-cli/releases/tag/v0.5.0)

```bash
gemini-api generate 'only public input' -m gemini-3.5-flash-lite \
  --body '{"store":false,"response_format":{"type":"text","mime_type":"application/json","schema":{"type":"object","properties":{"title":{"type":"string"}},"required":["title"]}}}' \
  --stream=false --no-interactive --output-format json --dry-run
```

このCLIは `POST /v1beta/interactions` を組み立てた。選定した週次更新のREST経路は `POST /v1beta/models/{model}:generateContent`。Deep ResearchはInteractions APIのプレビュー機能で、バックグラウンド実行にサーバー保存が必要。仕様上は通常20分以内、最長60分で、構造化出力には非対応。個別の週次更新には通常の短いモデル呼出しを使う。[Deep Researchの制限](https://aistudio.google.com/docs/deep-research#limitations)

## 出典と費用

Google Search Groundingには、検索で得たリンクを自動収集して索引化すること、クローリング先の特定に使うことを制限する条件がある。週次カタログでは、対象の提供者や出版社が公開するページ・フィードを直接たどり、取得した公開資料だけをモデルに渡す。検索リンクの永続化を要する用途にはGroundingを使用しない。書名・発行者・ライセンス等の証拠は一次資料で照合し、条件を満たさない候補は保留する。リポジトリ本文、PR、作業メモ、認証情報はモデル入力に含めない。[Gemini API追加規約](https://aistudio.google.com/docs/terms#use-restrictions2)

`gemini-3.5-flash-lite` の標準有償料金は100万トークン当たり入力0.30米ドル・出力2.50米ドル（思考分を含む）。例えば入力10,000・出力2,000なら1実行分のモデル代は約0.008米ドル。これは算定例で、実請求・実測値ではない。検索Groundingを使わないため検索料金は発生しない。テキスト生成には無料枠もあるが、対象枠・実効レート制限はAPIプロジェクトで確認する。無料サービスでは入力・出力が製品改善に利用され得る。Actions利用分はGitHub側の契約と実行時間に依存する。[Gemini料金](https://aistudio.google.com/docs/pricing#gemini-3.5-flash-lite) ／ [レート制限](https://aistudio.google.com/docs/rate-limits) ／ [GitHub Actionsの課金](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

手動検証では、受付・資料取得・生成・スキーマ検証・PR作成のどの段階で止まったかを確認する。認証・クォータエラーや通信失敗は「新着なし」と区別する。必須の証拠と差分を人が点検でき、無変更時も不要なPRが発生しないことを確かめてからCronに移行する。
