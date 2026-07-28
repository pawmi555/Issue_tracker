# Postman回帰テスト実施結果

## 1. 実施概要

過去の修正による既存機能への影響、および認証・認可・
バリデーション・論理削除に関する不具合が再発していないことを
確認するため、Postmanを使用して回帰テストを実施した。

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| 実施日       | 2026-07-29                                  |
| 対象コミット | `3526e580fa2edf00cf7a24e8d8fb660dc7e14649c` |
| 対象フォルダ | `05_Regression`                             |
| 実行環境     | Docker Compose開発環境                      |
| テスト方法   | Postmanによる手動テスト                     |
| テスト件数   | 29件                                        |
| 成功         | 29件                                        |
| 失敗         | 0件                                         |
| 総合結果     | PASS                                        |

## 2. 実施条件

- 開発環境が正常に起動していること
- DBがSeed実行後の状態であること
- Collection Variablesに必要なIDとAccess Tokenが設定されていること
- 各リクエストをフォルダ内の番号順に実行すること
- HTTPステータス、エラーコード、レスポンスおよび更新後の状態を確認すること

テスト開始前に、次のコマンドでDBを初期化した。

```bash
docker compose -f docker/docker-compose.dev.yml exec app npm run db:fresh
```

## 3. 実施結果

### 3.1 Authorization

| No. | テスト内容                                  | 期待結果                        | 実際の結果                                               | 判定 |
| --: | ------------------------------------------- | ------------------------------- | -------------------------------------------------------- | ---- |
|   1 | 非所属ADMINがProject一覧を取得              | `200`、Project一覧が空          | Project一覧は空で、非所属Projectは返らなかった           | PASS |
|   2 | 非所属ADMINがProject詳細を取得              | `403 PROJECT_FORBIDDEN`         | `403 PROJECT_FORBIDDEN`が返り、Project詳細は返らなかった | PASS |
|   3 | ADMINが削除済みUserを取得                   | `200`、削除済みUserを取得できる | `deleted-user@example.com`の情報を取得できた             | PASS |
|   4 | 一般USERが`includeDeleted=true`で自身を取得 | `403 FORBIDDEN`                 | `403 FORBIDDEN`が返った                                  | PASS |
|   5 | 一般USERが通常の条件で自身を取得            | `200`、自身のUser情報が返る     | ログインユーザー本人の情報が返った                       | PASS |

### 3.2 Project Members

次のテスト専用Projectを使用した。

| Project                        | 用途                               |
| ------------------------------ | ---------------------------------- |
| `Member Permission Regression` | メンバー追加・変更・削除権限の確認 |
| `Last Owner Regression`        | 最後のOWNER保護の確認              |

| No. | テスト内容                   | 期待結果                   | 実際の結果                                                           | 判定 |
| --: | ---------------------------- | -------------------------- | -------------------------------------------------------------------- | ---- |
|   1 | OWNERが2人目のOWNERを追加    | 成功し、OWNERが2人になる   | `outsider@example.com`がOWNERとして追加され、Projectへアクセスできた | PASS |
|   2 | MANAGERがOWNERを追加         | `403 OWNER_ROLE_FORBIDDEN` | `403 OWNER_ROLE_FORBIDDEN`が返り、対象Userは追加されなかった         | PASS |
|   3 | MANAGERがOWNERのロールを変更 | `403`、OWNERのまま         | `403`が返り、対象UserはOWNERのままだった                             | PASS |
|   4 | 最後のOWNERをMANAGERへ変更   | `400 LAST_OWNER_FORBIDDEN` | `400 LAST_OWNER_FORBIDDEN`が返り、OWNERが維持された                  | PASS |
|   5 | 最後のOWNERを削除            | `400 LAST_OWNER_FORBIDDEN` | `400 LAST_OWNER_FORBIDDEN`が返り、OWNERは削除されなかった            | PASS |
|   6 | MANAGERがMEMBERを削除        | `403`、MEMBERが維持される  | `403`が返り、MEMBERは削除されなかった                                | PASS |

### 3.3 Comment Authorization

テスト前に、MEMBERとMANAGERでそれぞれ確認用Commentを作成した。

| No. | テスト内容                   | 期待結果                          | 実際の結果                                    | 判定 |
| --: | ---------------------------- | --------------------------------- | --------------------------------------------- | ---- |
|   1 | MEMBERが自身のCommentを更新  | `200`、CommentHistoryが作成される | Commentが更新され、CommentHistoryが作成された | PASS |
|   2 | MEMBERが他者のCommentを更新  | `403`、内容と履歴が変化しない     | `403`が返り、Commentと履歴は変化しなかった    | PASS |
|   3 | MANAGERが他者のCommentを更新 | `200`、CommentHistoryが作成される | Commentが更新され、CommentHistoryが作成された | PASS |
|   4 | MEMBERが他者のCommentを削除  | `403`、Commentが残る              | `403`が返り、Commentは削除されなかった        | PASS |
|   5 | MANAGERが他者のCommentを削除 | `204`、レスポンスボディが空       | `204`が返り、Comment一覧から削除された        | PASS |

現在の仕様では、Comment削除履歴は確認対象外とした。

### 3.4 Assignee Rules

`user@example.com`が担当者として設定されているIssueを使用した。

| No. | テスト内容                        | 期待結果                                     | 実際の結果                                                            | 判定 |
| --: | --------------------------------- | -------------------------------------------- | --------------------------------------------------------------------- | ---- |
|   1 | MEMBERを同じ担当者として指定      | `200`、担当者・`updatedAt`・履歴が変化しない | 担当者は維持され、不要な履歴は作成されなかった                        | PASS |
|   2 | VIEWERを担当者として指定          | `400 ASSIGNEE_ROLE_FORBIDDEN`                | `400 ASSIGNEE_ROLE_FORBIDDEN`が返り、担当者と履歴は変化しなかった     | PASS |
|   3 | 他ProjectのUserを担当者として指定 | `400 ASSIGNEE_NOT_PROJECT_MEMBER`            | `400 ASSIGNEE_NOT_PROJECT_MEMBER`が返り、担当者と履歴は変化しなかった | PASS |

### 3.5 Deleted Project

次のSeedデータを使用した。

| 項目        | 内容                                                  |
| ----------- | ----------------------------------------------------- |
| Project     | `Issue Tracker Deleted`                               |
| OWNER       | `admin@example.com`                                   |
| MANAGER     | `manager@example.com`                                 |
| MEMBER      | `user@example.com`                                    |
| Child Issue | `Issue for deleted parent project regression testing` |

| No. | テスト内容                                       | 期待結果                           | 実際の結果                                                | 判定 |
| --: | ------------------------------------------------ | ---------------------------------- | --------------------------------------------------------- | ---- |
|   1 | MANAGERが削除済みProjectを含む一覧を取得         | `200`、削除済みProjectが含まれる   | `Issue Tracker Deleted`が含まれ、`total`にも反映された    | PASS |
|   2 | MEMBERが`includeDeleted=true`で一覧を取得        | `200`、削除済みProjectは含まれない | 未削除Projectだけが返り、削除済みProjectは返らなかった    | PASS |
|   3 | MANAGERが削除済みProject詳細を取得               | `200`、`deletedAt`が設定されている | 削除済みProjectと`deletedAt`を取得できた                  | PASS |
|   4 | MEMBERが削除済みProject詳細を取得                | `403 INSUFFICIENT_PROJECT_ROLE`    | `403 INSUFFICIENT_PROJECT_ROLE`が返り、詳細は返らなかった | PASS |
|   5 | `includeDeleted=true`なしで削除済みProjectを取得 | `404 PROJECT_NOT_FOUND`            | `404 PROJECT_NOT_FOUND`が返った                           | PASS |

### 3.6 Changed Validation

| No. | テスト内容                          | 期待結果                           | 実際の結果                                                                         | 判定 |
| --: | ----------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- | ---- |
|   1 | Projectを空のリクエストボディで更新 | `422 VALIDATION_ERROR`、DB更新なし | `422 VALIDATION_ERROR`が返り、Project・`updatedAt`・ProjectHistoryは変化しなかった | PASS |
|   2 | Projectを現在値と同じ値で更新       | `200`、DB更新なし                  | `200`が返り、Project・`updatedAt`・ProjectHistoryは変化しなかった                  | PASS |
|   3 | Issueのdescriptionを5000文字に更新  | `200`、5000文字で保存される        | 5000文字で保存され、変更履歴が作成された                                           | PASS |
|   4 | Issueのdescriptionを5001文字に更新  | `422 VALIDATION_ERROR`、DB更新なし | `422 VALIDATION_ERROR`が返り、descriptionと履歴は変化しなかった                    | PASS |
|   5 | 不正な`includeDeleted`を指定        | `422 VALIDATION_ERROR`             | `422 VALIDATION_ERROR`が返り、通常のProject一覧は返らなかった                      | PASS |

## 4. 総合結果

| カテゴリ              |   件数 |   PASS |  FAIL |
| --------------------- | -----: | -----: | ----: |
| Authorization         |      5 |      5 |     0 |
| Project Members       |      6 |      6 |     0 |
| Comment Authorization |      5 |      5 |     0 |
| Assignee Rules        |      3 |      3 |     0 |
| Deleted Project       |      5 |      5 |     0 |
| Changed Validation    |      5 |      5 |     0 |
| **合計**              | **29** | **29** | **0** |

すべての回帰テストで期待結果と実際の結果が一致した。

認証・認可、ProjectRole、担当者制約、論理削除、
空更新・同値更新および文字数制限について、
過去に修正した不具合の再発は確認されなかった。

## 5. 補足事項

### Comment IDの設定

テスト実施時は`memberCommentId`を手動設定した。
その後、Post-response Scriptの保存先をCollection Variablesへ統一し、
現在は自動設定されるよう修正済みである。

```javascript
const json = pm.response.json();

pm.collectionVariables.set("memberCommentId", json.data.id);
```

MANAGERのComment IDも同様に設定する。

```javascript
const json = pm.response.json();

pm.collectionVariables.set("managerCommentId", json.data.id);
```

この問題はテスト対象APIの実行結果には影響していない。

### テスト後のDB復元

回帰テストではProject、Project Member、Commentなどのデータを
作成・更新・削除するため、完了後に次のコマンドでDBをSeed状態へ戻した。

```bash
docker compose -f docker/docker-compose.dev.yml exec app npm run db:fresh
```
