# Newman自動テスト実施結果

| 項目               |                                       結果 |
| ------------------ | -----------------------------------------: |
| 実施日時           |                                 2026-08-01 |
| 対象コミット       | `fa2449d614ae4a6fda1f37104d9a43ba9006fdd2` |
| Newman             |                                    `6.2.2` |
| 実行環境           |                     Docker Compose開発環境 |
| 実行リクエスト     |                                         34 |
| Assertion          |                                         43 |
| 失敗したリクエスト |                                          0 |
| 失敗したAssertion  |                                          0 |
| 総合結果           |                                       PASS |
| 総実行時間         |                                    約3.8秒 |

対象フォルダ：

- `00_Setup`
- `01_Auth`
- `02_Projects`
- `03_Issues`
- `04_Histories`
- `06_Deleted User Middleware Regression`

※ Newmanが生成した生のJSONレポートには、Access Token、
Cookieなどの認証情報が含まれるため公開していません。
