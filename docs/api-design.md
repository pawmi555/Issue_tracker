# Issue Tracker API設計書

---

# 1. 概要

Issue管理システムのREST API設計書。

## 対象機能

### 実装済み（Phase1）

- 認証（JWT + Refresh Token）
- ユーザー管理
- プロジェクト管理
- プロジェクトメンバー管理
- Issue管理
- コメント管理
- 履歴管理

### 実装予定（Phase2）

- Internal API
- APIログ管理

---

# 2. 基本情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Base URL   | `/api/v1`        |
| 認証方式   | JWT Bearer Token |
| DB         | PostgreSQL       |
| ORM        | Prisma           |
| Validation | Zod              |
| Pagination | page / limit     |

---

# 3. 共通仕様

## 認証

```http
Authorization: Bearer <access_token>
```

---

### Token保存方針

#### Access Token

- Response Body返却
- クライアントメモリ保持
- Authorization Header送信

#### Refresh Token

- HttpOnly Cookie保存
- Token Rotation採用
- Cookie設定は「Cookie Policy」に従う

---

### Cookie Policy

- Cookie名: refresh_token
- HttpOnly=true
- Secure=true（production）
- Secure=false（development）
- SameSite=None（production）
- SameSite=Lax（development）
- Path=/api/v1/auth
- Max-Age=604800（7日）

---

### CORS Policy

#### 制約

- Cookie認証利用時はcredentials=true必須
- Access-Control-Allow-Originに\*は使用不可
- Access-Control-Allow-Originは単一Originを返却する
- 許可Originは環境変数で管理
- Access-Control-Allow-Credentials=true

#### Development

```txt
Origin:
http://localhost:3000
```

#### Production

```txt
Origin:
https://app.example.com
```

#### Server Setting

```txt
Access-Control-Allow-Credentials: true
```

---

## Response DTO

APIレスポンスはDTOを返却する。

- ControllerはDTOのみ返却する
- DTOへの変換はMapper層で行う
- DB Entity・ORMモデルはAPIレスポンスへ直接返却しない
- DTOはAPI契約（Response Contract）として扱う

---

### UserSummaryDto

一覧取得および関連リソース参照で使用する簡易DTO。必要最小限の項目のみを保持し、詳細情報は保持しない。
| Field | Type | Description |
| ----- | ------ | ----------- |
| id | number | ユーザーID |
| name | string | ユーザー名 |
| deletedAt（includeDeleted=trueのみ） | ISO8601 \| null |

#### Example

```json
{
  "id": 1,
  "name": "Admin User"
}
```

---

### UserDto

詳細取得・作成・更新APIで使用するDTO。リソースの詳細情報を保持する。
| Field | Type |
| --------- | ------- |
| id | number |
| name | string |
| email | string |
| role | RoleDto |
| createdAt | ISO8601 |
| updatedAt | ISO8601 |
| deletedAt（includeDeleted=trueのみ） | ISO8601 \| null |

#### Example

```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": {
    "id": 1,
    "name": "ADMIN",
    "label": "管理者"
  },
  "createdAt": "2026-06-04T11:30:59.329Z",
  "updatedAt": "2026-06-09T06:40:16.979Z"
}
```

---

### LoginResponseDto

ログインAPIレスポンス
| Field | Type |
| ----------- | -------------- |
| user | UserDto |
| accessToken | string |

#### Example

```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": {
      "id": 1,
      "name": "ADMIN",
      "label": "管理者"
    },
    "createdAt": "2026-06-04T11:30:59.329Z",
    "updatedAt": "2026-06-09T06:40:16.979Z"
  },
  "accessToken": "jwt..."
}
```

---

### RefreshTokenDto

アクセストークン再発行APIレスポンス
| Field | Type |
| ----------- | ------ |
| accessToken | string |

#### Example

```json
{
  "accessToken": "jwt..."
}
```

---

### RegisterResponseDto

ユーザー登録APIレスポンス
| Field | Type |
| ----------- | ------ |
| user | UserDto |

#### Example

```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": {
      "id": 1,
      "name": "ADMIN",
      "label": "管理者"
    },
    "createdAt": "2026-06-04T11:30:59.329Z",
    "updatedAt": "2026-06-09T06:40:16.979Z"
  }
}
```

---

### RoleDto

ロール情報（UserRole / ProjectRole）
| Field | Type |
| ----- | ------ |
| id | number |
| name | string |
| label | string |

#### Example

```json
{
  "id": 1,
  "name": "ADMIN",
  "label": "管理者"
}
```

---

### StatusDto

Issueステータス情報
| Field | Type |
|------|------|
| id | number |
| name | string |
| label | string |

#### Example

```json
{
  "id": 1,
  "name": "OPEN",
  "label": "未着手"
}
```

---

### PriorityDto

Issue優先度情報
| Field | Type |
|------|------|
| id | number |
| name | string |
| label | string |

#### Example

```json
{
  "id": 1,
  "name": "HIGH",
  "label": "高"
}
```

---

### CountDto

関連リソースの集計情報

Prismaの \_count は公開しない。
APIでは CountDtoへ変換して返却する。
| Field | Type |
|------|------|
| members | number |
| issues | number |

#### Example

```json
{
  "members": 2,
  "issues": 10
}
```

---

### ProjectSummaryDto

一覧取得および関連リソース参照で使用する簡易DTO。必要最小限の項目のみを保持し、詳細情報は保持しない。

| Field                                | Type            |
| ------------------------------------ | --------------- |
| id                                   | number          |
| name                                 | string          |
| description                          | string          |
| owner                                | UserSummaryDto  |
| counts                               | CountDto        |
| createdAt                            | ISO8601         |
| updatedAt                            | ISO8601         |
| deletedAt（includeDeleted=trueのみ） | ISO8601 \| null |

---

### ProjectDto

詳細取得・作成・更新APIで使用するDTO。リソースの詳細情報を保持する。

ProjectSummaryDtoを拡張したDTO

| Field   | Type               |
| ------- | ------------------ |
| ownerId | number             |
| members | ProjectMemberDto[] |

---

### ProjectReferenceDto

IssueAPIで使用するDTO。

| Field | Type   |
| ----- | ------ |
| id    | number |
| name  | string |

---

### ProjectMemberDto

プロジェクトメンバー情報
| Field | Type |
| --------- | -------------- |
| id | number |
| role | RoleDto |
| user | UserSummaryDto |
| createdAt | ISO8601 |
| updatedAt | ISO8601 |

---

### IssueSummaryDto

一覧取得および関連リソース参照で使用する簡易DTO。必要最小限の項目のみを保持し、詳細情報は保持しない。
関連リソースはinclude指定時のみ返却する。
| Field | Type |
| -------------------------------- | -------------- |
| id | number |
| title | string |
| dueDate | ISO8601 \| null |
| createdAt | ISO8601 |
| updatedAt | ISO8601 |
| deletedAt（includeDeleted=trueのみ） | ISO8601 \| null |
| project（include指定時のみ） | ProjectReferenceDto \| null |
| assignee（include指定時のみ） | UserSummaryDto \| null |
| reporter（include指定時のみ） | UserSummaryDto \| null |

---

### IssueDto

詳細取得・作成・更新・復元APIで使用するDTO。リソースの詳細情報を保持する。

IssueSummaryDtoを拡張したDTO。

詳細取得時の基本情報を保持し、
関連リソースはinclude指定時のみ返却する。

追加フィールド

| Field                         | Type           |
| ----------------------------- | -------------- |
| description                   | string \| null |
| status                        | StatusDto      |
| priority                      | PriorityDto    |
| comments（include指定時のみ） | CommentDto[]   |

---

### CommentDto

コメント情報
| Field | Type |
| --------- | -------------- |
| id | number |
| content | string |
| user | UserSummaryDto |
| createdAt | ISO8601 |
| updatedAt | ISO8601 |
| deletedAt（includeDeleted=trueのみ） | ISO8601 \| null |

---

### HistoryDto

変更履歴情報
| Field | Type |
| --------- | ------------------------------------------------------ |
| action | HistoryActionDto |
| field | HistoryFieldDto |
| oldValue | HistoryValueDto |
| newValue | HistoryValueDto |
| changedBy | UserSummaryDto |
| createdAt | ISO8601 |

---

### HistoryActionDto

変更履歴の操作種別
| Value | Type |
| ------- | ------ |
| CREATE | string |
| UPDATE | string |
| DELETE | string |
| RESTORE | string |

---

### HistoryValueDto

変更履歴の型
| Value | Type |
| ------- | ------ |
| string | string |
| number | string |
| boolean | string |
| object | string |
| unknown[] | string |
| null | string |

---

### HistoryFieldDto

変更対象フィールドを表す公開用DTO。

内部で使用する `HistoryField` は公開せず、APIではクライアント向けのフィールド名へ変換して返却する。
| Value |Type |
| ------|----- |
| name | string |
| email | string |
| role | string |
| project | string |
| description | string |
| title | string |
| status | string |
| priority | string |
| assignee | string |
| dueDate | string |
| deletedAt | string |
| content | string |

---

### ApiLogDto

APIアクセスログ情報

| Field     | Type    |
| --------- | ------- |
| requestId | string  |
| method    | string  |
| path      | string  |
| userId    | number  |
| status    | number  |
| duration  | number  |
| createdAt | ISO8601 |

---

### PaginationMetaDto

ページネーション情報

| Field      | Type   | Description |
| ---------- | ------ | ----------- |
| page       | number | 現在ページ  |
| limit      | number | 取得件数    |
| total      | number | 総件数      |
| totalPages | number | 総ページ数  |

#### Example

```json
{
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5
}
```

---

## 共通レスポンス

204 No Content の場合、Response Bodyは返却しない。

### 成功

```json
{
  "success": true,
  "data": {}
}
```

---

### ページング取得

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

※metaは PaginationMetaDto とする。

---

### 失敗

#### VALIDATION_ERROR（422）

errors:

- VALIDATION_ERROR時のみ返却
- fieldはRequest BodyのJSON Path
- 順序は入力順

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "メール形式が不正です"
    },
    {
      "field": "password",
      "message": "8文字以上必要です"
    }
  ]
}
```

#### その他エラー

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "詳細メッセージ"
}
```

---

## エラーコードルール

#### 形式

RESOURCE_REASON

#### 例

| code                     | status | 内容                       |
| ------------------------ | ------ | -------------------------- |
| USER_NOT_FOUND           | 404    | ユーザー不存在             |
| PROJECT_NOT_FOUND        | 404    | プロジェクト不存在         |
| PROJECT_FORBIDDEN        | 403    | プロジェクト権限なし       |
| ISSUE_NOT_FOUND          | 404    | Issue不存在                |
| COMMENT_NOT_FOUND        | 404    | コメント不存在             |
| ISSUE_CLOSED             | 409    | クローズ済みのため更新不可 |
| INVALID_REFRESH_TOKEN    | 401    | 無効または失効したトークン |
| VALIDATION_ERROR         | 422    | 入力エラー                 |
| UNAUTHORIZED             | 401    | 未認証                     |
| ISSUE_INVALID_TRANSITION | 409    | 許可されない状態遷移       |

---

## HTTPステータスコード

| Code | 意味                 |
| ---- | -------------------- |
| 200  | 成功                 |
| 201  | 作成成功             |
| 204  | 削除成功             |
| 400  | 入力不正             |
| 401  | 未認証               |
| 403  | 権限なし             |
| 404  | データなし           |
| 409  | リソース競合         |
| 422  | バリデーションエラー |
| 500  | サーバーエラー       |

---

## Pagination

### Query Parameter

| Name  | Type   | Default | Max |
| ----- | ------ | ------- | --- |
| page  | number | 1       | -   |
| limit | number | 20      | 100 |

#### Response

一覧取得APIは PaginationMetaDto を返却する。

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 制約

- limit 最大100

---

## Middleware

| Middleware              | 役割                    |
| ----------------------- | ----------------------- |
| authMiddleware          | JWT認証                 |
| adminMiddleware         | ADMINのみ許可           |
| userOwnerMiddleware     | 自分とADMINのみ許可     |
| projectRoleMiddleware   | ProjectRole権限チェック |
| requireRoleMiddleware   | RBAC認可                |
| validateMiddleware      | Zod validation          |
| requestLoggerMiddleware | APIログ                 |
| errorMiddleware         | 共通エラーハンドリング  |
| notFoundMiddleware      | 404エラー処理           |

---

## include設計

#### 対象API

- GET /projects/:projectId/issues
- GET /issues/:id

```http
?include=assignee,reporter,comments,project
```

#### 制約

- ホワイトリスト制
- 最大4件
- 重複指定不可
- 不正なinclude指定時は422を返却
- commentsはIssue詳細取得時のみ指定可能

#### Include Resource

| Include Resource | Response                                           |
| ---------------- | -------------------------------------------------- |
| project          | object (id, name)                                  |
| assignee         | object (id, name)                                  |
| reporter         | object (id, name)                                  |
| comments         | object[] (id, content, user, createdAt, updatedAt) |

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Login Bug",
    "description": "Cannot login with test account",
    "dueDate": null,
    "createdAt": "2026-07-10T11:15:14.661Z",
    "updatedAt": "2026-07-10T11:15:14.661Z",
    "status": {
      "id": 1,
      "name": "OPEN",
      "label": "未着手"
    },
    "priority": {
      "id": 3,
      "name": "HIGH",
      "label": "高"
    },
    "project": {
      "id": 1,
      "name": "Issue Tracker"
    },
    "assignee": {
      "id": 2,
      "name": "Test User"
    },
    "reporter": {
      "id": 1,
      "name": "Admin User"
    },
    "comments": [
      {
        "id": 1,
        "content": "調査します",
        "user": {
          "id": 1,
          "name": "Admin User"
        },
        "createdAt": "2026-07-10T11:16:54.103Z",
        "updatedAt": "2026-07-10T11:16:54.103Z"
      }
    ]
  }
}
```

---

## DateTime Format

すべての日時はISO8601形式で返却する。

### 例

2026-05-01T10:00:00Z

### ルール

- DBはUTCで保存
- APIはUTCで返却
- クライアント側でローカルタイムへ変換

---

## Field Naming Rule

履歴・監査ログの内部保存で使用するフィールド名形式。
APIレスポンスではMapperにより公開用フィールド名へ変換する。

形式:
RESOURCE_COLUMN

例:
USER_NAME
PROJECT_DESCRIPTION
ISSUE_STATUS_ID
COMMENT_CONTENT

---

## Internal Value Mapping

内部値はDB保存時に変換しない。

変換ルール:

- 通常API: 表示用DTOへ変換して返却

- 履歴API:
  fieldName → 表示用フィールド名へ変換
  oldValue/newValueを表示値へ変換して返却

例（通常API）

DB:
priorityId = 2

API:
priority:
{
"id": 2,
"name": "HIGH",
"label": "高"
}

例（履歴API）

DB:
oldValue = 1
newValue = 2

API:
field: "status"
oldValue = "OPEN"
newValue = "IN_PROGRESS"

---

### DTO Mapping Rule

レスポンス整形はMapper層で行う。

責務:

- fieldName → fieldへ変換
- oldValue/newValue → 表示値へ変換
- 不要な内部フィールドを除外
- API契約を維持する

例:

DB:
{
fieldName: "ISSUE_STATUS_ID",
oldValue: 1,
newValue: 2
}

↓

API:
{
field: "status",
oldValue: "OPEN",
newValue: "DONE"
}

---

## Audit Data Policy

監査データは内部値・内部フィールド名を保持する。

API返却時のみ表示用DTOへ変換する。

例:
statusId:
DB: 1 → 2

API:
field: "status"
oldValue: "OPEN"
newValue: "IN_PROGRESS"

---

# 4. Master定義

## UserRole

| name  | 説明                                             |
| ----- | ------------------------------------------------ |
| ADMIN | 管理者。全ユーザー管理・全プロジェクト管理が可能 |
| USER  | 一般ユーザー                                     |

---

## ProjectRole

| name    | 説明                          |
| ------- | ----------------------------- |
| OWNER   | プロジェクト作成者。全権限    |
| MANAGER | メンバー管理・Issue管理が可能 |
| MEMBER  | Issue作成・更新・コメント可能 |
| VIEWER  | 閲覧のみ                      |

---

## IssueStatus

| name        | 説明                 |
| ----------- | -------------------- |
| OPEN        | 未着手               |
| IN_PROGRESS | 対応中               |
| REVIEW      | レビュー待ち         |
| DONE        | 作業完了             |
| CLOSED      | 完全終了（変更不可） |

---

### Issue状態遷移

#### 許可される状態遷移

| From        | To          |
| ----------- | ----------- |
| OPEN        | IN_PROGRESS |
| IN_PROGRESS | REVIEW      |
| REVIEW      | DONE        |
| DONE        | CLOSED      |

#### 制約

- CLOSEDから他状態への変更不可
- スキップ遷移不可
- 巻き戻し不可

---

## IssuePriority

| name     | 説明           |
| -------- | -------------- |
| LOW      | 低             |
| MEDIUM   | 中             |
| HIGH     | 高             |
| CRITICAL | 緊急・重大障害 |

---

# 5. History仕様

## 共通ルール

oldValue/newValue:
JSON形式で保持
型:
string | number | boolean | null | object | array

ルール:

- 単一値もJSONとして保存する
- null変更は明示保存
- 配列・Objectも保持可能

---

## HistoryAction

| name    |
| ------- |
| UPDATE  |
| DELETE  |
| RESTORE |

---

## 共通レスポンス仕様

changedBy:
履歴作成ユーザーをUser参照して返却

field:
変更対象の表示用フィールド名

oldValue:
変更前の表示値

newValue:
変更後の表示値

---

### UserHistory

ユーザー変更履歴を保持する。

#### 保存対象

- name
- email
- roleId

#### 保存内容（DB）

- action
- fieldName
- oldValue
- newValue
- userId
- createdAt

#### Response

共通レスポンス仕様のとおり

---

### ProjectHistory

プロジェクト変更履歴を保持する。

#### 保存対象

- name
- description

#### 保存内容（DB）

- action
- fieldName
- oldValue
- newValue
- userId
- createdAt

#### Response

共通レスポンス仕様のとおり

---

### IssueHistory

Issue変更履歴を保持する。

#### 保存対象（内部保存値）

- title
- description
- statusId
- priorityId
- assigneeId
- dueDate
- deletedAt

#### 保存内容（DB）

- action
- fieldName
- oldValue
- newValue
- userId
- createdAt

#### Response

共通レスポンス仕様のとおり

---

### CommentHistory

コメント変更履歴を保持する。

#### 保存対象

- content

#### 保存内容（DB）

- action
- fieldName
- oldValue
- newValue
- userId
- createdAt

#### Response

共通レスポンス仕様のとおり

---

# 6. 論理削除

### 対象リソース

- User
- Project
- Issue
- Comment

### Query Parameter

```http
?includeDeleted=true
```

### 制約

- 明示的に指定しない限り`deletedAt = null`のデータのみ返却する
- `includeDeleted=true`指定時は、削除済・未削除を区別せず返却する
- 削除済データのみ取得する用途はサポートしない
- includeDeletedは対象リソースのみに適用する（関連リソースへ伝播しない）
- 親リソースが論理削除済の場合、その子リソースは参照不可
- 詳細取得APIは`includeDeleted=true`指定時のみ削除済データ取得可能
- 履歴（History）は監査目的のためSoft Delete対象外
- UserリソースのincludeDeleted利用はADMINのみ許可
- Project/Issue/CommentはMANAGER以上のみ利用可能
- Paginationの `total` は取得対象条件適用後の件数を返却

### 一覧取得（デフォルト）

```ts
where: {
  deletedAt: null,
  project: {
    deletedAt: null
  }
}
```

### 一覧取得（includeDeleted=true）

```ts
where: {
}
```

### 詳細取得

対象リソース自身に対してincludeDeletedを適用する。
親リソースが論理削除済の場合は404扱いとする。

```ts
// includeDeleted未指定
where: {
  id,
  deletedAt: null
}

// includeDeleted=true
where: {
  id,
}
if (issue.project.deletedAt !== null) {
  throw new AppError("project not found", 404, "PROJECT_NOT_FOUND");
}
```

### API適用範囲

| API                      | includeDeleted | 権限制御    |
| ------------------------ | -------------- | ----------- |
| GET /projects            | ○              | MANAGER以上 |
| GET /projects/:id        | ○              | MANAGER以上 |
| GET /projects/:id/issues | ○              | MANAGER以上 |
| GET /issues/:id          | ○              | MANAGER以上 |
| GET /issues/:id/comments | ○              | MANAGER以上 |
| GET /users               | ○              | ADMIN       |
| GET /histories           | ×              | 非対応      |
|                          |                |             |

---

# 7. バリデーション方針

- Zod使用
- DB存在チェック必須
- 外部キー整合性チェック必須

---

# 8. 認可設計

## 原則

- **ユーザーは所属プロジェクトのデータのみアクセス可能**
- **一般ユーザーは自分情報のみ参照可能。ユーザー情報変更はADMINのみ許可する。**
- **ADMINは全リソースアクセス可能**
- **OWNERはプロジェクト削除可能**
- **VIEWERは更新不可**

---

# 9. トランザクション方針

以下はトランザクション必須：

- User更新（履歴作成含む）
- Project更新（履歴作成含む）
- Issue更新（履歴作成含む）
- Comment更新（履歴作成含む）
- Refresh Token更新

---

# 10. API一覧

## 10.1 Auth API

### 10.1.1 ユーザー登録

#### POST `/auth/register`

#### Request

```json
{
  "name": "string (1-50)",
  "email": "email",
  "password": "8文字以上"
}
```

#### Validation

- email UNIQUE
- password >= 8

#### Response DTO

data : RegisterResponseDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "string (1-50)",
      "email": "email",
      "role": {
        "id": 2,
        "name": "USER",
        "label": "一般ユーザー"
      },
      "createdAt": "2026-06-04T11:30:59.329Z",
      "updatedAt": "2026-06-04T11:30:59.329Z"
    }
  }
}
```

---

### 10.1.2 ログイン

#### POST `/auth/login`

#### Request

```json
{
  "email": "test@test.com",
  "password": "password123"
}
```

#### Response DTO

data : LoginResponseDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": {
        "id": 1,
        "name": "ADMIN",
        "label": "管理者"
      },
      "createdAt": "2026-06-04T11:30:59.329Z",
      "updatedAt": "2026-06-09T06:40:16.979Z"
    },
    "accessToken": "jwt..."
  }
}
```

#### Response Cookie

共通仕様「Cookie Policy」に従い、refresh_token を発行する

---

### 10.1.3 トークン再発行

#### POST `/auth/refresh`

#### 制約

- Refresh Token Rotation採用
- DBにはハッシュ化して保存
- 使用済みRefresh Tokenは失効
- 新しいRefresh Tokenを発行
- replacedByTokenでトークンチェーンを保持
- 失効済みTokenの再利用を検知した場合は全Refresh Tokenをrevoke

#### Request Cookie

共通仕様「Cookie Policy」に従う

```http
Cookie:
refresh_token=xxx
```

#### Response DTO

data : RefreshTokenDto

#### Example Response

新しいAccess Tokenを返却する（Refresh TokenはResponse Cookieで更新）

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt"
  }
}
```

#### Response Cookie

共通仕様「Cookie Policy」に従い、refresh_token を更新する

---

### 10.1.4 ログアウト

#### POST `/auth/logout`

#### 制約

- RefreshToken revoke
- 既に失効済みでも成功扱い（冪等）

#### Request Cookie

共通仕様「Cookie Policy」に従う

```http
Cookie:
refresh_token=xxx
```

#### Response

```http
204 No Content
```

#### Response Cookie

共通仕様「Cookie Policy」に従い、refresh_token を削除する

---

### 10.1.5 自分情報取得

#### GET `/auth/me`

#### 制約

- 自分の情報のみ取得可能
- Authorization Header必須
- Access Tokenからログインユーザーを取得

#### Response DTO

UserDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": {
      "id": 1,
      "name": "ADMIN",
      "label": "管理者"
    },
    "createdAt": "2026-06-04T11:30:59.329Z",
    "updatedAt": "2026-06-09T06:40:16.979Z"
  }
}
```

---

## 10.2. User API

### 10.2.1 ユーザー一覧

#### GET `/users?page=1&limit=20`

#### 制約

- UserRoleがADMINの場合のみ一覧取得可能

#### Response DTO

data : UserSummaryDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 10.2.2 ユーザー詳細

#### GET `/users/:id`

#### 制約

- 自分またはUserRoleがADMINの場合のみ取得可能

#### Response DTO

data : UserDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Test User",
    "email": "user@example.com",
    "role": {
      "id": 2,
      "name": "USER",
      "label": "一般ユーザー"
    },
    "createdAt": "2026-06-04T11:30:59.329Z",
    "updatedAt": "2026-06-09T06:40:16.979Z"
  }
}
```

---

### 10.2.3 ユーザー更新

#### PATCH `/users/:id`

#### 制約

- UserRoleがADMINの場合のみ更新可能
- 最後のADMINは自身のroleをADMIN以外へ変更不可
- 削除済みユーザーは更新不可

#### 更新可能項目

- name
- email
- roleId

#### 更新不可項目

- createdAt

#### Request

```json
{
  "name": "New Name",
  "email": "test@example.com",
  "roleId": 2
}
```

#### Response DTO

data : UserDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "New Name",
    "email": "new@test.com",
    "role": {
      "id": 2,
      "name": "USER",
      "label": "一般ユーザー"
    },
    "createdAt": "2026-06-09T06:35:10.123Z",
    "updatedAt": "2026-06-09T06:40:16.979Z"
  }
}
```

---

### 10.2.4 ユーザー削除

#### DELETE `/users/:id`

#### 制約

- 論理削除
- UserRoleがADMINの場合のみ削除可能

#### Response

```http
204 No Content
```

---

## 10.3 Project API

### 10.3.1 プロジェクト作成

### POST `/projects`

#### 制約

- ownerId = ログインユーザー
- Project作成時に、作成者をProjectMemberへOWNER権限で自動追加
- 同一ユーザー内でproject.nameは一意

#### Request

```json
{
  "name": "Issue Tracker",
  "description": "社内管理ツール"
}
```

#### Response DTO

data : ProjectDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "application1",
    "description": "Sample project",
    "ownerId": 1,
    "owner": {
      "id": 1,
      "name": "Admin User"
    },
    "counts": {
      "members": 1,
      "issues": 0
    },
    "createdAt": "2026-07-08T14:50:39.024Z",
    "updatedAt": "2026-07-08T14:50:39.024Z",
    "members": [
      {
        "id": 7,
        "role": {
          "id": 1,
          "name": "OWNER",
          "label": "プロジェクト作成者。全権限"
        },
        "user": {
          "id": 1,
          "name": "Admin User"
        },
        "createdAt": "2026-07-08T14:50:39.024Z",
        "updatedAt": "2026-07-08T14:50:39.024Z"
      }
    ]
  }
}
```

---

### 10.3.2 プロジェクト一覧取得

### GET `/projects?page=1&limit=20`

#### 制約

- 自分が所属するプロジェクトのみ一覧取得可能

#### Response DTO

data : ProjectSummaryDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "sample application",
      "description": "Sample project",
      "owner": {
        "id": 1,
        "name": "Admin User"
      },
      "counts": {
        "members": 1,
        "issues": 0
      },
      "createdAt": "2026-06-10T13:06:41.080Z",
      "updatedAt": "2026-06-10T13:06:41.080Z"
    },
    {
      "id": 1,
      "name": "Issue Tracker",
      "description": "Sample project",
      "owner": {
        "id": 1,
        "name": "Admin User"
      },
      "counts": {
        "members": 2,
        "issues": 1
      },
      "createdAt": "2026-06-10T11:05:56.661Z",
      "updatedAt": "2026-06-10T11:05:56.661Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 10.3.3 プロジェクト詳細

### GET `/projects/:id`

#### 制約

- ProjectRoleがMEMBER以上のみ詳細取得可能

#### Response DTO

data : ProjectDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "application1",
    "description": "Sample project",
    "ownerId": 1,
    "owner": {
      "id": 1,
      "name": "Admin User"
    },
    "counts": {
      "members": 1,
      "issues": 0
    },
    "createdAt": "2026-07-08T14:50:39.024Z",
    "updatedAt": "2026-07-08T14:50:39.024Z",
    "members": [
      {
        "id": 7,
        "role": {
          "id": 1,
          "name": "OWNER",
          "label": "プロジェクト作成者。全権限"
        },
        "user": {
          "id": 1,
          "name": "Admin User"
        },
        "createdAt": "2026-07-08T14:50:39.024Z",
        "updatedAt": "2026-07-08T14:50:39.024Z"
      }
    ]
  }
}
```

---

### 10.3.4 プロジェクト更新

### PATCH `/projects/:id`

#### 制約

- ProjectRoleがMANAGER以上の場合のみ更新可能
- Project変更履歴を作成
- トランザクション必須

#### 更新可能項目

- name
- description

#### 更新不可項目

- id
- ownerId
- createdAt

#### Request

```json
{
  "name": "Updated Project"
}
```

#### Response DTO

data : ProjectDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "application1",
    "description": "Sample project",
    "ownerId": 1,
    "owner": {
      "id": 1,
      "name": "Admin User"
    },
    "counts": {
      "members": 1,
      "issues": 0
    },
    "createdAt": "2026-07-08T14:50:39.024Z",
    "updatedAt": "2026-07-08T14:50:39.024Z",
    "members": [
      {
        "id": 7,
        "role": {
          "id": 1,
          "name": "OWNER",
          "label": "プロジェクト作成者。全権限"
        },
        "user": {
          "id": 1,
          "name": "Admin User"
        },
        "createdAt": "2026-07-08T14:50:39.024Z",
        "updatedAt": "2026-07-08T14:50:39.024Z"
      }
    ]
  }
}
```

---

### 10.3.5 プロジェクト削除

### DELETE `/projects/:id`

#### 制約

- ProjectRoleがOWNER以上の場合のみ削除可能
- 論理削除

#### Response

```http
204 No Content
```

---

## 10.4. Project Member API

### 10.4.1 メンバー追加

### POST `/projects/:id/members`

#### 制約

- userは存在必須
- ログインユーザーが対象ProjectのMANAGER以上であること
- 追加対象ユーザーは未所属であること
- UNIQUE(projectId, userId)

#### Request

```json
{
  "userId": 3,
  "role": "MEMBER"
}
```

### Response DTO

data : ProjectMemberDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 7,
    "userId": 3,
    "projectId": 6,
    "roleId": 3,
    "createdAt": "2026-06-11T06:50:51.435Z",
    "updatedAt": "2026-06-11T06:50:51.435Z",
    "user": {
      "id": 3,
      "name": "test",
      "email": "test@example.com"
    }
  }
}
```

---

### 10.4.2 メンバー一覧

### GET `/projects/:id/members`

#### 制約

- ログインユーザーが対象ProjectのMANAGER以上であること

### Response DTO

data : ProjectMemberDto[]

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "Admin User"
      },
      "role": {
        "id": 1,
        "name": "OWNER",
        "label": "オーナー"
      },
      "createdAt": "2026-06-10T11:05:56.661Z",
      "updatedAt": "2026-06-10T11:05:56.661Z"
    }
  ]
}
```

---

### 10.4.3 メンバー権限変更

### PATCH `/projects/:id/members/:userId`

#### 制約

- OWNERは最低1人必要
- 最後のOWNER降格禁止
- OWNER権限付与はOWNERのみ
- ログインユーザーが対象ProjectのMANAGER以上であること

#### Request

```json
{
  "role": "MEMBER"
}
```

### Response DTO

data : ProjectMemberDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "role": {
      "id": 1,
      "name": "OWNER",
      "label": "オーナー"
    },
    "createdAt": "2026-06-10T11:05:56.661Z",
    "updatedAt": "2026-06-10T11:05:56.661Z"
  }
}
```

---

### 10.4.4 メンバー削除

### DELETE `/projects/:id/members/:userId`

#### 制約

- ログインユーザーが対象ProjectのMANAGER以上であること
- OWNERメンバーの削除はOWNERのみ可能
- OWNERは最低1人必要
- 最後のOWNER削除禁止
- 物理削除

#### Response

```http
204 No Content
```

---

## 10.5 Issue API

### 10.5.1 Issue作成

### POST `/projects/:projectId/issues`

#### 制約

- ProjectRoleがMEMBER以上の場合のみ作成可能
- projectメンバーのみ
- 担当者は対象プロジェクトに所属かつProjectRoleがMEMBER以上
- priority/status存在チェック
- 作成時statusはOPEN固定
- RequestでstatusId指定不可

#### Request

```json
{
  "title": "ログインできない",
  "description": "500 error",
  "priorityId": 1,
  "assigneeId": 2,
  "dueDate": "2026-06-13T13:32:210.151Z"
}
```

#### Response DTO

data : IssueDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "ログインできない12",
    "description": "500 error",
    "dueDate": "2026-05-01T00:00:00.000Z",
    "createdAt": "2026-07-10T00:13:27.901Z",
    "updatedAt": "2026-07-10T00:13:27.901Z",
    "status": {
      "id": 1,
      "name": "OPEN",
      "label": "未着手"
    },
    "priority": {
      "id": 1,
      "name": "LOW",
      "label": "低"
    }
  }
}
```

---

### 10.5.2 Issue一覧取得

### GET `/projects/:id/issues`

#### Query

- page / limit
- statusId / priorityId
- assigneeId
- keyword（部分一致、ILIKE）
- sort: createdAt / dueDate
- order: asc / desc

#### 制約

- sortホワイトリスト
- include最大6件
- プロジェクトメンバーのみ取得可能

#### Response DTO

data : IssueSummaryDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Login Bug",
      "dueDate": null,
      "createdAt": "2026-07-08T03:29:57.665Z",
      "updatedAt": "2026-07-08T03:32:25.021Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 10.5.3 Issue詳細取得

## GET `/issues/:id`

#### 制約

- プロジェクトメンバーのみ取得可能

#### Response DTO

data : IssueDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "修正",
    "description": "500 error",
    "dueDate": "2026-05-01T00:00:00.000Z",
    "createdAt": "2026-07-08T15:01:25.312Z",
    "updatedAt": "2026-07-09T23:01:51.533Z",
    "status": {
      "id": 2,
      "name": "IN_PROGRESS",
      "label": "対応中"
    },
    "priority": {
      "id": 1,
      "name": "LOW",
      "label": "低"
    }
  }
}
```

---

### 10.5.4 Issue更新

### PATCH `/issues/:id`

#### 制約

- 対象Issueの担当者かつProjectRoleがMEMBER以上、またはProjectRoleがMANAGER以上の場合のみ更新可能
- statusがCLOSEDは更新不可
- reporterId変更不可
- status更新時は「Issue状態遷移」に従う
- 不正な状態遷移は409 Conflictを返却
- Issue変更履歴を作成
- トランザクション必須

#### 更新可能項目

- title
- description
- statusId
- priorityId
- assigneeId
- dueDate

#### 更新不可項目

- id
- projectId
- reporterId
- createdAt

#### Request

```json
{
  "title": "修正",
  "statusId": 2,
  "assigneeId": 1
}
```

#### Response DTO

data : IssueDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "修正",
    "description": "500 error",
    "dueDate": "2026-05-01T00:00:00.000Z",
    "createdAt": "2026-07-10T00:13:27.901Z",
    "updatedAt": "2026-07-10T00:19:41.308Z",
    "status": {
      "id": 2,
      "name": "IN_PROGRESS",
      "label": "対応中"
    },
    "priority": {
      "id": 1,
      "name": "LOW",
      "label": "低"
    }
  }
}
```

---

### 10.5.5 Issue削除

### DELETE `/issues/:id`

- 論理削除
- ProjectRoleがMANAGER以上の場合のみ削除可能

#### Response

```http
204 No Content
```

---

### 10.5.6 Issue復元

### POST `/issues/:id/restore`

#### 制約

- deletedAt != null
- project削除済みなら不可
- 削除済みIssueのみ復元可能
- CLOSEDは復元不可
- ProjectRoleがMANAGER以上の場合のみ復元可能

#### Response

```json
{
  "success": true
}
```

---

## 10.6 Comment API

### 10.6.1 コメント投稿

### POST `/issues/:id/comments`

#### 制約

- ProjectRoleがMEMBER以上のみ投稿可能

#### Request

```json
{
  "content": "調査します"
}
```

#### Response DTO

data : CommentDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "修正",
    "user": {
      "id": 1,
      "name": "Admin User"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 10.6.2 コメント一覧

### GET `/issues/:id/comments?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ
- ソート順は createdAt ASC

#### Response DTO

data : CommentDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "修正",
      "user": {
        "id": 1,
        "name": "Admin User"
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 10.6.3 コメント更新

### PATCH `/comments/:id`

#### 制約

- 投稿者または ProjectRoleがMANAGER以上の場合のみ可能
- 更新時はCommentHistory作成
- トランザクション必須

#### Request

```json
{
  "content": "修正版コメント"
}
```

#### Response DTO

data : CommentDto

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "修正版コメント",
    "user": {
      "id": 1,
      "name": "Admin User"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 10.6.4 コメント削除

### DELETE `/comments/:id`

#### 制約

- 投稿者またはProjectRoleがMANAGER以上の場合のみ削除可能
- 論理削除

#### Response

```http
204 No Content
```

---

## 10.7 History API

### 共通制約

- createdAt DESC
- 最新履歴を先頭に返却
- Pagination適用

#### レスポンス変換ルール

履歴データは内部値を保持し、API返却時にMapperで表示用DTOへ変換する。

変換ルール:

- マスタ値（statusId、priorityId 等）は表示値へ変換して返却する
- 参照系フィールド（assigneeId 等）は識別子を返却する
- fieldNameは公開用フィールド名（field）へ変換する

### 10.7.1 User履歴一覧

### GET `/users/:id/histories?page=1&limit=20`

#### 制約

- 自分またはADMINのみ取得可能

#### Response DTO

data : HistoryDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "action": "UPDATE",
      "field": "role",
      "oldValue": "USER",
      "newValue": "ADMIN",
      "changedBy": {
        "id": 1,
        "name": "Admin"
      },
      "createdAt": "2026-04-26T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 10.7.2 Project履歴一覧

### GET `/projects/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ取得可能

#### Response DTO

data : HistoryDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "action": "UPDATE",
      "field": "description",
      "oldValue": "Issue管理システム",
      "newValue": "社内Issue管理システム",
      "changedBy": {
        "id": 1,
        "name": "Admin"
      },
      "createdAt": "2026-04-26T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 10.7.3 Issue履歴一覧

### GET `/issues/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ取得可能

#### Response DTO

data : HistoryDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "action": "UPDATE",
      "field": "status",
      "oldValue": "OPEN",
      "newValue": "DONE",
      "changedBy": {
        "id": 1,
        "name": "Admin"
      },
      "createdAt": "2026-04-26T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 10.7.4 Comment履歴一覧

### GET `/comments/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ取得可能

#### Response DTO

data : HistoryDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "action": "UPDATE",
      "field": "content",
      "oldValue": "調査します",
      "newValue": "調査完了しました",
      "changedBy": {
        "id": 1,
        "name": "Admin"
      },
      "createdAt": "2026-04-26T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 10.8 Internal API（実装予定）

本APIは監査・運用支援用途として設計済み。
ポートフォリオ初期リリース（Phase1）では未実装とし、後続フェーズで追加予定。

### 10.8.1 APIログ一覧（実装予定）

### GET `/admin/logs?page=1&limit=50`

#### 制約（予定）

- ADMINのみ取得可能

#### ログ方針（予定）

- 全API記録
- requestId
- method
- path
- userId
- status
- duration

#### Response DTO

data : ApiLogDto[]
meta : PaginationMetaDto

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "requestId": "req_xxxxx",
      "method": "GET",
      "path": "/api/v1/projects",
      "userId": 1,
      "status": 200,
      "duration": 35,
      "createdAt": "2026-06-26T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

# 11. セキュリティ

- パスワードはハッシュ化
- JWT短命 + RefreshToken
- 不正時全revoke
- 入力バリデーション必須

---

# 12. 参考資料

■ Prisma公式
https://www.prisma.io/docs

■ REST設計
https://restfulapi.net/

■ 認可設計（RBAC）
https://auth0.com/docs/manage-users/access-control/rbac

■ トークン設計
https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation

---

# 補足（設計意図）

- DB設計と完全整合
- スケーラビリティ考慮
- セキュリティ重視
- 実務運用前提
- JWT + RefreshToken Rotation採用
- RBAC採用
- 論理削除採用
- User、Project、Issue、Comment変更履歴管理
- 状態遷移制御
- 実務運用を想定した監査性を重視
- DTO + MapperによりAPI契約を維持

## DTO採用方針

APIレスポンスはDTOを返却する。
DBスキーマ変更の影響をAPI利用者へ与えないことを目的とし、レスポンス整形はMapper層が担当する。

---
