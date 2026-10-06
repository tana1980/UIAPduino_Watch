# 初回構築レポート — 2026-10-06

## 収録

|項目|件数|
|---|---:|
|Total Resources|62|
|Official|11|
|Japan|52|
|Overseas|1|
|Global|9|
|Project|24|
|Shop|4|
|Article|17|
|Video|0（元動画ページ未確認）|

カテゴリは複数指定でき、件数は重複する。初回おすすめは3件、未採用の確認済み候補は59件。

初回は3件のみで終了せず、公式資料、国内記事、GitHub実例、教育、開発環境、国内外の販売先を本文確認して登録した。海外の収録はElecrow販売ページ1件で、海外コミュニティ記事の探索は制約が残る。英語GitHub資料を作者の国籍を推測してOverseasに分類せず、Globalにした。

## 調査した情報源と見送り

UIAP公式、公式GitHub、GitHub検索64件、Qiita内検索16件、Zenn検索5件、うたカモ、Setup Diary、FabScene、X、スイッチサイエンス、BOOTH、BTOS、Elecrowを確認。Hackaday/CNX Softwareは検索結果なし、Hacksterは取得した静的ページでは結果不明。

GoogleはJavaScript要求、DuckDuckGoはbot確認、noteは静的結果不足・API403、YouTubeは接続拒否。一般検索・動画・noteの全探索完了は主張しない。取得制約のあるページをスニペットだけで登録しない。

「WIP: DO NOT USE」のMIDI実装、本文不足のREADME、UIAPduino記事を参照するだけのトレンド一覧、タイトルしか取れない販売ページ、公式が非推奨と表示するTindieは初期おすすめの入口から除外。同系統のゲームで件数を増やさず代表例を採用。詳細は [research-log.md](research-log.md)、追跡URLは [discovery-backlog.yml](discovery-backlog.yml)。

## 検証

- Node.js 24 / npm、lockfileから `npm ci` で再インストール。
- Astro静的ビルド：トップ、情報一覧、掲載方針の3ページ。
- データ検証：62件、必須項目、形式、日付、Official分類、重複URL、候補・推薦参照。
- Node回帰テスト：12件。未知値や形式違反、重複、欠落、検索のAND条件など。
- ブラウザ：3ページ × 390px/1280px、横はみ出し、WCAG A/AA、4フィルタ、検索、URL保持、リセット、キーボード、JavaScript無効、project pagesのパス配下でCSS/JS。
- 外部リンク確認：HEAD、非対応時GET。詳細は実行時生成の `reports/link-check.json`（Git管理外）。

## GitHubと公開

サイト名・npm名は `UIAPduino Watch` / `uiapduino-watch`。選択された作業リポジトリは `tana1980/info_uiapduino` のため、無断で改名していない。

空のリポジトリにPR比較元としてソースを含まない初期 `main` コミットを作成し、サイト本体は `feat/uiapduino-watch` ブランチで提案する。GitHubの非公開メール保護は、GitHub noreplyアドレスによる自身の新規コミットで解消した。既存コミットの書き換えや強制pushは行っていない。

GitHub Pagesの参照APIは `Resource not accessible by integration`（403）。この連携によるPagesの有効化は未確認。ユーザーが **Settings → Pages → Source: GitHub Actions** を設定し、PRを確認・mergeする必要がある。

公開予定URL： https://tana1980.github.io/info_uiapduino/ 。デプロイ成功確認前のため公開済みURLではない。`main` merge後はbuild → validate/test → deployが自動実行される。

初回PR URLは作成確認後、チャットの最終報告とGitHub上で案内する。

## 今後の課題

- YouTube、note、一般Web検索の取得制約を解消して調査を再開する。
- 海外チュートリアル・制作例を引き続き探す。見つからないことと未確認を区別する。
- 公式のCH32V002準備状況、V006 Beta、Tiny Pad Alphaの変化を追う。
- 次の週次推薦は新着と59件の過去候補を比較する。
- 必要ならGitHubリポジトリを仕様の `uiapduino-watch` へ移行し、READMEの貢献リンクを変更する。Pagesのbaseはリポジトリ名から自動生成する。

## リポジトリ名変更 — 2026-10-06

初回PR #1はマージされ、旧パスでのPagesデプロイは成功。その後、ユーザーの依頼でリポジトリ名を `UIAPduinoWatch` に変更する更新を追加。現在の公開先は https://tana1980.github.io/UIAPduinoWatch/ 。上記の初回設定時の制約・予定は履歴として保持する。
