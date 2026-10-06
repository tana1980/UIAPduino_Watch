# 初回調査記録 — 2026-10-06

## 確認方法と範囲

検索結果は発見用にのみ使用し、登録は元ページ本文・READMEを確認してから行った。製品仕様・公式関係の基準は https://www.uiap.jp/uiapduino/ 。URLの実在性チェックだけで本文確認の代わりにはしない。各登録に確認日と確認URL、取得内容のハッシュを記録した。実機、動画の再生、引用した第三者の手順の追試は行っていない。

公式ページで確認した製品は CH32V003 V1.4（General Availability）、CH32V006 V1.1（Beta）、Tiny CH32 Pad Lite V0.1（Alpha）。CH32V002は準備中として案内されており、販売済み製品として登録していない。旧版・準備中の別シリーズは製品構成を増やすためだけには登録していない。

調査した主な情報源：

- UIAP公式シリーズ、V003/V006/Tiny Pad製品資料、イベント記録、英語資料。資料内の開発環境、Arduino、設計データ、販売先、コミュニティ参照リンクを辿った。
- 公式から案内される `YuukiUmeta-UIAP` のUIAP-Devices、Arduinoコア、rv003usb、ボードマネージャ、ゲームコンソールのフォーク。公式関係はアカウント名だけでは判断しない。
- GitHubリポジトリ検索 `UIAPduino`：64件、7ページを取得。元リポジトリを訪問しREADMEを読み、用途・価値を確認したものを選別。
- GitHubの英語クエリ `UIAPduino project`, `UIAPduino tutorial`, `UIAPduino CH32V003`, `UIAPduino CH32V006`, `UIAPduino Arduino`, `UIAPduino RISC-V`, `UIAPduino WebHID`。RISC-V/WebHIDの初回429は時間を置いた再検索で解消。
- 製品名検索 `UIAPduino Pro Micro CH32V003`, `UIAPduino Pro Micro CH32V006`, `UIAPduino CH32V002`, `Tiny CH32 Pad`。GitHubで新たなV002/Tiny Padリポジトリは見つからず、公式の資料・フォークから調査。
- Qiitaのサービス内検索：16件の元ページを取得。直接関係する導入・制作・比較記事を選び、組織の記事一覧や一般トレンド一覧を除外。
- Zennのサービス内公開検索API：5件。元記事を取得し、PlatformIO、Mac Lチカ、製造取材、教育環境の記事を収録。短い週次報告は有用なリンクを辿る発見資料として使用。
- Makerメディア：FabSceneの開発者・量産取材記事を元本文で確認。
- 個人ブログ：うたカモ、島根大学ドメインのSetup Diary。デバイス紹介とDebianでの試用記録を確認。
- 国内販売先：スイッチサイエンス、UIAP BOOTH、BTOS。海外：Elecrow、Tindie。公式からの案内と元販売ページを確認。
- X：液晶デモ作者の公開投稿を確認。
- 海外Makerメディア：Hackaday、CNX Softwareの `UIAPduino` サイト内検索は両方「Nothing Found」。Hacksterは静的取得では検索結果が表示されず、結果不明。

## 一般検索の制約

Googleで上記の英語クエリ、国内サービス指定、製品名検索を実施したが、取得HTMLはJavaScriptの再試行画面で検索結果を確認できなかった。Bingの非引用検索は無関係な結果、DuckDuckGoはUIAPduinoをArduinoへ補正した。引用符付き検索に変更したところbot確認（HTTP 202）となり、検索結果を読めなかった。結果がないとは判断していない。

一般検索は掲載根拠に使わず、公式と元記事の参照リンク、GitHub・Qiita・Zenn内検索に切り替えた。これらの再検索で新しく得られる用途が減った段階で収録を整理したが、**一般Web検索・note・動画・海外記事の探索は制約が残るため、全探索の完了・網羅性は主張しない**。

## 掲載を見送った主な候補

|候補|理由・次の確認|
|---|---|
|`hsgw/uiapduino_v003_prog_midi`|README冒頭に「WIP: DO NOT USE」。利用を薦める初期情報から除外。将来の完成を確認。|
|空のREADME、タイトルだけのGitHubリポジトリ|ソース・利用手順を十分に読み解けず読者価値を確認できない。スニペットだけでは登録しない。|
|`chandana-docs/UIAPduino-CH32V003`|READMEはexample projectsの一文のみ。内容の追加確認まで保留。所在国も推測しない。|
|`metanest/UIAPduino-Mandelbrot`|READMEはタイトルのみ。制作方法や対象の確認が不足。|
|`inufuto`のゲーム多数|各ゲームの元READMEを確認。初回ではLIFT・ASCEND・AntiAirを選び、同じ構成・同じ作者の類似ゲームだけで件数を増やさない。ほかは下記の追跡リストに残す。|
|Qiitaの組織記事一覧／毎日トレンド紹介|UIAPduino記事へのリンクを含むが、直接の内容がない。元記事を収録。|
|一般CH32V003記事、上流の汎用ゲームコンソール|UIAPduinoとの直接関係が確認できないページを単独で増やさない。UIAP公式フォークと直接使用の制作例を優先。|
|ロボ☆スタディオンの販売ページ|取得本文はタイトルのみ。元商品説明を確認できるまで保留。|
|Tindie販売ページ|実在するが公式は「非推奨」と表示。購入の入口は公式が推奨するElecrowを優先し、在庫や推薦の事情を推測しない。|
|YouTube `ztnDVnJdpo0`, `O8TE0JtaixU`|公式・作者が参照しているが、この環境から元動画ページを確認できない。Videoカテゴリには未登録。参照元を根拠に動画内容を補完しない。|
|noteの検索|静的HTMLに記事本文・検索結果がなく、公開検索APIは403。記事が存在しないという判断はしていない。|
|Hacksterの検索|JavaScriptによる結果表示が必要で、結果不明。|

## 保留情報を失わないための追跡

掲載前の未確認情報は `docs/discovery-backlog.yml` に保存。確認済み・収録済みの情報は `data/candidates.yml` に保持する。未確認情報はWebサイトへ表示せず、Weekly Picksの選考に入れる前に元ページを確認する。
