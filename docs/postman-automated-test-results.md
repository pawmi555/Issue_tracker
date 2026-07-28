# Postman自動テスト実施結果

| 項目               |                                        結果 |
| ------------------ | ------------------------------------------: |
| 実施日時           |                                  2026-07-29 |
| 対象コミット       | `3526e580fa2edf00cf7a24e8d8fb660dc7e14649c` |
| Newman             |                                     `6.2.2` |
| 実行環境           |                      Docker Compose開発環境 |
| 実行リクエスト     |                                          34 |
| Assertion          |                                          43 |
| 失敗したリクエスト |                                           0 |
| 失敗したAssertion  |                                           0 |
| 総合結果           |                                        PASS |
| 総実行時間         |                                     約3.7秒 |

対象フォルダ：

- `00_Setup`
- `01_Auth`
- `02_Projects`
- `03_Issues`
- `04_Histories`
- `06_Deleted User Middleware Regression`

※ Newmanが生成した生のJSONレポートには、Access Token、
Cookieなどの認証情報が含まれるため公開していません。
