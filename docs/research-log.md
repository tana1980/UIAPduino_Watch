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


## 週次調査記録 — 2026-10-11

### 確認した範囲

- 公式シリーズページとイベントページを再確認。CH32V003 V1.4、CH32V006 V1.1 Beta、Tiny CH32 Pad Lite V0.1 Alpha、および準備中製品の表示を確認。PicoRubyKaigi 2026 Assemble（2026-10-31）の展示協賛とUIAPduino提供の記載を確認し、公式イベントリソースを更新。
- Web検索語：`UIAPduino 2026 project CH32V003`、`"UIAPduino" "2026"`、`site:github.com UIAPduino CH32V003 project`、`"UIAPduino Pro Micro CH32V006" project tutorial`、`"Tiny CH32 Pad Lite"`、`UIAPduino WebHID FFT note papico`。英語クエリを含む検索を実施。検索結果は発見に使い、採用根拠は元ページ本文を確認。
- GitHub検索結果を確認し、既存GitHub候補と照合。検索で見つかった汎用CH32V003案件はUIAPduinoの直接利用を本文で確認できなかったため追加しなかった。今回、追加登録したGitHub情報はない。
- Zennの2026-10-03記事「URB Block Lab と最近のXの投稿まとめ」を本文確認。ブロック→Ruby→URB1バイトコード→EEPROM→TinyVMの流れ、24FC256対応、Xcratch v0.3.0、接続診断、CoderDojoでの改善を確認。
- noteの `papico_2020` による2026-09-23 WebHID記事と2026-09-12 センサー・FFT記事を本文確認。前者はWebHID LabのHID Console、Ruby/ブロック環境、CdS測定値表示、後者は複数センサーとメモリ制約下のFFT表示を確認。
- nRF Connect SDKのZephyrボード資料を本文確認。UIAPduino Pro Micro CH32V003の基本GPIO/LED、minichlink、west build/flash手順と、ページ上の保守状態表示を確認。

### 選定・見送り

- Weekly Picksは公式の次回予定、子ども向け電子工作に実装されたブロック環境の新機能、Zephyrでの開発手順を組み合わせ、イベント／教育記事／開発ドキュメントの分野を分散した。
- noteのWebHID記事は技術的価値があるが、今週選んだZennの更新記事とWebHID Labの話題が一部重なるため候補として保存。センサー・FFT記事も独立した制作事例として候補に残し、次週以降に比較する。
- 3件の選定理由は、開催時期の近さ、子ども向け教育・EEPROM対応などの最近の具体的な開発、別開発環境の手順と保守状態が明確な資料である。

### 未確認範囲

この実行ではYouTubeでは検索結果から既存の紹介動画の内容・公開日を確認したが、今回の新規情報としては採用しなかった。Qiita、Zenn、noteのサービス内検索と本文、公式イベント、GitHub検索を確認。公開SNSの全投稿、各ショップの商品ページ、一般検索サービスの網羅的探索までは行っていない。検索結果の未表示を「情報なし」とは扱わない。Zephyr資料は最新ドキュメントとして公開されているが、ページ上で積極的な保守担当者がいないと表示されるため、その点を紹介文に含めた。

## 週次調査記録 — 2026-10-13

- 公式シリーズページを確認。CH32V003 V1.4、CH32V006 V1.1 Beta、Tiny CH32 Pad Lite V0.1 Alphaを現行資料の基準とした。CH32V002などの準備中製品は発売済みと扱わない。
- 日本語・英語のWeb検索で `UIAPduino project tutorial CH32V003 CH32V006`、`UIAPduino WebHID RISC-V Arduino`、個別製品名を調査。GitHub、Qiita、Zenn、note、技術ブログ、YouTube、公開SNS、イベント、Shopに関する検索結果と既存データを照合した。一般のCH32V003記事はUIAPduinoとの直接の関係を確認できなければ収録しない。
- kame404 blogのWindows向けHID開発記事、ロジックラボのLED点滅教材、jh4vajのUFSS01実験ボードの公開本文を確認し、3件を登録。既存候補のセンサー・FFT制作記事も元ページを再確認した。
- 今週はUSB開発の実用手順、センサー・FFTという制作上の工夫、初学者向けの段階的教材を選定。UFSS01は用途が異なる良質なハードウェア情報として候補に保持した。
- 掲載済み65件のURL応答確認では64件が到達、Zephyr資料1件が403。404/410は確認されず、403はリンク切れと断定しない。公開SNS投稿や動画の内容の網羅確認、個々のショップの在庫・価格確認は行っていない。

## 週次調査記録 — 2026-10-18

- 公開GitHubのmainは37acf58で前回と同一。未公開の10月13日草案を再評価し、推薦日を今回の実行日に合わせた。
- UIAP公式シリーズでCH32V003 V1.4、CH32V006 V1.1 Beta、Tiny CH32 Pad Lite V0.1 Alphaを確認。CH32V002は準備中。第三者の制作例をOfficialとは扱わない。
- 日本語・英語検索：`UIAPduino 2026 October project tutorial CH32V003 CH32V006`、`UIAPduino WebHID RISC-V Arduino overseas GitHub`、`UIAPduino Pro Micro CH32V006 October 2026`、GitHub・Qiita・Zenn・note・YouTube・公開SNS・イベント・Shopの指定検索を実施。検索結果と既存登録・候補を照合し、一般的なCH32記事はUIAPduinoとの直接関係がない限り除外した。
- 10月16日のnote記事は公開本文を確認。サーボ工作の改札機・プラレール分岐、厚紙での取付位置・干渉確認を確認した。記事中の埋め込みSNS投稿の個人情報や画像は転載しない。記事中に製品型番は明示されないため製品は未指定とした。
- Windows向けHID手順、LED点滅教材、センサー・FFT記事を再確認。候補全体と比較し、今週はHIDの実装手順、サーボを使う制作記録、初心者向け教材を推薦。FFTとUFSS01は確認済み候補として保持。
- 全公開ページの外部URLは71件中70件到達、404/410なし、Zephyr資料1件は403で要再確認。リソース69件に加え、案内ページのGitHubリンク2件を含む。転送先はリンクチェック記録で確認し、不審な別サイト転送は検出されなかった。HTTP応答の確認は全ページの本文再読と同義ではない。
- YouTubeの動画内容、公開SNSの全投稿、販売店の在庫・価格、一般検索の網羅性は確認していない。これらの情報を推薦理由には使用しない。

## 週次調査記録 — 2026-10-25

### 確認した範囲

- 最新main（2688a9b）から作業。10月18日版のWeekly Picksと候補、前回PR案を照合し、掲載済みのWindows HID・サーボ工作・Lチカ教材、未マージPR案内のWebHID Lab・ソフトクリームファン等を再採用しない。
- UIAP公式シリーズページを本文確認。Pro Micro CH32V003 V1.4、CH32V006 V1.1 Beta、Tiny CH32 Pad Lite V0.1 Alphaと、準備中のCH32V002等の表示を確認。個別製品名を含めて検索した。公式イベントページも本文確認し、PicoRubyKaigi 2026 Assemble（10月31日）、NT名古屋2026（11月14〜15日）、電波文化祭7（11月22日）を確認して既存イベント記録を更新。
- 検索語：`UIAPduino project October 2026 new build`、`UIAPduino CH32V003 site:github.com October 2026`、`UIAPduino site:youtube.com after:2026-10-18`、`UIAPduino site:qiita.com OR site:zenn.dev OR site:note.com after:2026-10-18`、`site:connpass.com UIAPduino 2026 October workshop`、`UIAPduino Pro Micro CH32V006 OR Tiny CH32 Pad Lite after:2026-10-18`、`"Snake-on-eInk" UIAPduino GitHub Open-EP`。英語検索を含む。
- RISC-V Internationalの2026-10-09記事本文を確認。Open-EP Communityの電子ペーパーをUIAPduino Pro Micro CH32V003で駆動し、フレームバッファや描画ライブラリを使わず画素を計算してSPIへ出力する例を確認。LinkedInの公開投稿本文とも照合。
- jh4vajのUFSS01記事を再確認。CH32V003 V1.4向け実験ボードの部品、回路、使い方、製作工程と、経験者向けとの対象読者の説明を確認。価格・在庫は記録しない。
- 10月31日のCoderDojo末広町UIAPduino体験会は、一覧にイベント名と日付が掲載されている一方、個別ConnpassページがHTTP 202（アクセス制限）となり本文を確認できず、候補登録・推薦に使用しなかった。
- note、Qiita、Zenn、GitHub、YouTube、公開SNS、イベント、Shopを指定語で検索。noteのLチカまとめは10月18日版に掲載された教材と重なるため除外。検索で出たYouTube内容は個別確認できず採用していない。公開SNS全投稿、全Shop商品ページの網羅確認はしていない。

### 選定・見送り

- 2件を選定。省メモリの電子ペーパー駆動は海外コミュニティの独自応用として技術的な面白さがあり、UFSS01は回路・製作情報を含む既存候補として実験者に実用性がある。前者は海外の応用例、後者は国内の実験ハードウェアと対象・地域を分散した。
- 3件目は、直近の公開情報で本文まで確認でき、既掲載内容とも重複しないだけの価値を確かめられなかったため追加しない。
- 既存のブレイクアウト基板候補はUFSS01とハードウェア用途が近く、今週の優先候補から外した。Connpassの体験会は本文未確認のため保存しない。
