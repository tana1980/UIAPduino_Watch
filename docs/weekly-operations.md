# UIAPduino Watch 週次更新の運用

2026-11-24の試験の基準は main の d96b70a。正本はYAML形式で77リソース、59候補、推薦7版。READMEに掲載基準があり、当時のmainにAGENTS.mdはない。調査時点の未マージ提案は #11 と #13。公開ビルド、PR検証、月曜のリンク検査、日曜の旧AI更新が存在した。今回の導入PRは、旧AI更新と同じworkflowを手動試験用に置き換える。既存の定期更新を切り替えるのは両サイトの実運転確認後とする。

## 初期設定と手動試験

1. Google AI Studioで利用可能なGeminiプロジェクトのAPIキーを用意する。リポジトリの **Settings → Secrets and variables → Actions → Repository secrets** に `GEMINI_API_KEY` を保存する。既存の同名Secretが有効なら再登録は不要。APIキーはGitHubのSecret入力欄だけに入力する。
2. **Settings → Actions → General → Workflow permissions** の **Allow GitHub Actions to create and approve pull requests** を確認する。組織ポリシーによる制限がある場合は管理者に依頼する。ワークフローが行う操作はブランチとPR作成のみ。
3. **Actions → Weekly research update → Run workflow** で `automation/weekly-watch-pilot` を選ぶ。導入マージ後は `main` を選ぶ。初回は `dry_run` で生成、照合、ビルドのログを確認できる。実際のデータPR作成まで試す回はチェックを外す。対象データは実行時の最新main。導入ブランチのコードだけを使用する。
4. **Research primary sources → Apply verified records → Validate data and build Pages** と **Summary** を確認する。新規情報の有無、既存PR、保留件数、API使用トークン数、mainのSHA、作成PRまたは更新不要の理由を照合する。モデル結果が空なら新規推薦の捏造は行わない。既存PRや同週の版を検出した場合、その理由を記録する。
5. 手動実行成功後、両サイトの切替を同じ運用週に合わせる。旧ChatGPT更新タスクを監査専用に変更したことを確認し、別PRでworkflowのコメント済みscheduleを有効化する。`17 11 * * 0` は日曜20:17 JST。スケジュールはdefault branchから実行される。最初の日曜はActionsのschedule実行、SummaryとPR（または見送り理由）を記録する。

## 調査と検証

巡回先は公式シリーズ・イベント、Zenn・Qiita・noteのフィード、GitHub Topics、ProtoPedia、既存候補を使う。実行時間を制限するため、リンクをたどる数には上限がある。既存候補全体を直近の紹介カテゴリ・地域・製品と比較し、上位候補を週単位で入れ替えて一次資料を再確認する。公開ウェブ全体や全SNSを対象とする網羅調査は別途必要。Geminiへの入力は固定の編集指示と取得できた公開ページ。モデルに書き込み権限を与えない。ISBNや書誌の自動入力は対象外。

紹介文は元資料の本文を確認できたものについてだけ提案する。本文にある短い照合箇所と取得内容のハッシュを `docs/research-log.md` に残す。このファイルはAstroの公開ページに含まれない。外部HTTPエラーや引用不一致の件数はActionsの調査ログで確認する。曖昧な著者・公開日はnull、製品は未確認を許す。

検証は `npm ci`、`npm run validate`、`npm test`、`npm run build`。独立した元URLの実取得、ID・正規化URL・候補と過去推薦の参照整合性も確認する。通常の月曜全サイトリンク検査は既存のworkflowが担当する。エンジンの回帰テストは `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s .github/watch`。

## 障害時

| 実行結果 | 対応 |
| --- | --- |
| Secret不足、Gemini 401/403 | Secret名、Google側のキー有効性、対象APIとプロジェクト権限を確認する。キーの値はログへ出さない。 |
| 429、5xx、タイムアウト | APIのクォータ・予算とサービス状態を確認し、復旧後に同じ週で再実行する。 |
| 発行元403・非公開ページ、本文不一致 | 未確認として見送る。発行元の公開資料・新しいURLを確認し、必要なら巡回先設定を別PRで更新する。 |
| schema/test/build失敗 | Actionsの失敗箇所を確認。最新mainで同じ検証を実行し、不整合を修正して再試験する。 |
| main更新、PR追加、ブランチ競合 | 最新の未マージ差分を点検し、main基準で再実行する。同一週ブランチに既存コミットがある場合は内容を調べ、必要な提案を手動で回収する。 |
| PR作成が403 | ActionsのPR作成設定を点検する。検証済みブランチと既存PRを確認してから処理を再試行する。 |

## ChatGPT PMOの監査

- 実行イベント、mainのSHA、年月週、モデル、対象ソース、保留・候補・採用件数、テスト結果を確認する。
- 新規行ごとに一次URLを開き、調査ログの照合箇所、実際の作者、製品・版・ライセンスの記述、日本語での紹介が資料の根拠と一致するか確認する。
- 確認できない値、過去の同一作品の言い換え、短縮URL・追跡URL、過去の推薦や未マージPRとの重複を点検する。既存IDを保持し、選定済みIDが候補から除外されたことを確認する。
- 公開ページの紹介に内部指示・作業メモ・個人連絡先・認証情報が混入していないことを確認する。確認できない提案は保留理由をユーザーに報告する。
- ユーザーがマージを判断する。マージ後は deploy-pages の成功と、公開ページの推薦日、件数、各リンクを照合する。[UIAPduino Watch](https://tana1980.github.io/UIAPduino_Watch/)
