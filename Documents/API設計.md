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

## 共通レスポンス

204 No Content の場合、Response Bodyは返却しない。

### 成功

```json
{
  "success": true,
  "data": {}
}
```

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

#### Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
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
?include=assignee,reporter,comments,project,status,priority
```

#### 制約

- ホワイトリスト制
- 最大6件
- 重複指定不可
- 不正なinclude指定時は422を返却
- commentsはIssue詳細取得時のみ指定可能

#### include whitelist

| resource |
| -------- |
| assignee |
| reporter |
| comments |
| project  |
| status   |
| priority |

#### Response

```json
{
  "id": 1,
  "title": "ログインできない",
  "description": "500 error",

  "status": {
    "id": 1,
    "name": "OPEN",
    "label": "未着手"
  },

  "priority": {
    "id": 2,
    "name": "HIGH",
    "label": "高"
  },

  "project": {
    "id": 1,
    "name": "Issue Tracker"
  },

  "assignee": {
    "id": 1,
    "name": "Tanaka"
  },

  "reporter": {
    "id": 2,
    "name": "Suzuki"
  },

  "comments": [
    {
      "id": 1,
      "content": "調査します"
    }
  ]
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
fieldName: "ISSUE_STATUS_ID"
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

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string (1-50)",
    "email": "email"
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

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
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

#### Response

新しいAccess Tokenを返却する（Refresh TokenはResponse Cookieで更新）

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt"
  }
}
```

### Response Cookie

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

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

---

## 10.2. User API

### 10.2.1 ユーザー一覧

#### GET `/users?page=1&limit=20`

#### 制約

- UserRoleがADMINの場合のみ一覧取得可能

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": {
        "id": 1,
        "name": "ADMIN",
        "label": "管理者"
      },
      "createdAt": "2026-06-04T11:30:59.329Z"
    }
  ]
}
```

---

### 10.2.2 ユーザー詳細

#### GET `/users/:id`

#### 制約

- 自分またはUserRoleがADMINの場合のみ取得可能

#### Response

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
    }
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
- role

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

#### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "New Name",
    "email": "new@test.com",
    "role": {
      "id": 2,
      "name": "USER"
    },
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

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ownerId": 1,
    "name": "Issue Tracker",
    "description": "社内管理ツール",
    "createdAt": "2026-06-10T05:18:59.669Z",
    "updatedAt": "2026-06-10T05:18:59.669Z"
  }
}
```

---

### 10.3.2 プロジェクト一覧取得

### GET `/projects?page=1&limit=20`

#### 制約

- 自分が所属するプロジェクトのみ一覧取得可能

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "ownerId": 1,
      "name": "sample application",
      "description": "Sample project",
      "createdAt": "2026-06-10T13:06:41.080Z",
      "updatedAt": "2026-06-10T13:06:41.080Z",
      "owner": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "_count": {
        "members": 1,
        "issues": 0
      }
    },
    {
      "id": 1,
      "ownerId": 1,
      "name": "Issue Tracker",
      "description": "Sample project",
      "createdAt": "2026-06-10T11:05:56.661Z",
      "updatedAt": "2026-06-10T11:05:56.661Z",
      "owner": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "_count": {
        "members": 2,
        "issues": 1
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2
  }
}
```

---

### 10.3.3 プロジェクト詳細

### GET `/projects/:id`

#### 制約

- ProjectRoleがMEMBER以上のみ詳細取得可能

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ownerId": 1,
    "name": "Issue Tracker",
    "description": "Sample project",
    "createdAt": "...",
    "updatedAt": "...",
    "owner": {
      "id": 1,
      "name": "Admin User"
    },
    "_count": {
      "members": 2,
      "issues": 1
    }
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

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ownerId": 1,
    "name": "Updated Project",
    "description": "updated",
    "createdAt": "2026-06-11T06:35:31.6102Z",
    "updatedAt": "2026-06-11T06:35:40.013Z"
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

#### Response

```json
{
  "success": true,
  "data": {
    "id": 7,
    "userId": 3,
    "projectId": 1,
    "role": {
      "id": 3,
      "name": "MEMBER"
    },
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

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "projectId": 1,
      "createdAt": "2026-06-10T11:05:56.661Z",
      "updatedAt": "2026-06-10T11:05:56.661Z",
      "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "role": {
        "id": 1,
        "name": "OWNER"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
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

#### Response

```json
{
  "success": true,
  "data": {
    "id": 7,
    "userId": 3,
    "projectId": 1,
    "createdAt": "2026-06-11T06:50:51.435Z",
    "updatedAt": "2026-06-11T06:52:34.266Z",
    "role": {
      "id": 3,
      "name": "MEMBER"
    },
    "user": {
      "id": 3,
      "name": "test",
      "email": "test@example.com"
    }
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
- assigneeはメンバー限定
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

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "...",
    "status": {
      "name": "OPEN"
    },
    "createdAt": "..."
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
- ProjectRoleがMEMBER以上なら一覧取得可能

---

### 10.5.3 Issue詳細取得

## GET `/issues/:id`

#### 制約

- プロジェクトメンバーのみ取得可能

---

### 10.5.4 Issue更新

### PATCH `/issues/:id`

#### 制約

- assigneeまたはProjectRoleがMANAGER以上の場合のみ更新可能
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
  "statusId": 1,
  "assigneeId": 3
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "修正",
    "description": "Cannot login with test account",
    "dueDate": null,
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
    "assignee": {
      "id": 2,
      "name": "Test User"
    },
    "updatedAt": "2026-06-13T13:32:210.151Z"
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
  "success": true,
  "data": {
    "id": 1,
    "deletedAt": null
  }
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

---

### 10.6.2 コメント一覧

### GET `/issues/:id/comments?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ
- ソート順は createdAt ASC

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

### 10.7.1 User履歴一覧

### GET `/users/:id/histories?page=1&limit=20`

#### 制約

- 自分またはADMINのみ取得可能

#### Response

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
    "total": 1
  }
}
```

---

### 10.7.2 Project履歴一覧

### GET `/projects/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ取得可能

#### Response

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
    "total": 1
  }
}
```

### 10.7.3 Issue履歴一覧

### GET `/issues/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ取得可能

#### Response

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
    "total": 1
  }
}
```

---

### 10.7.4 Comment履歴一覧

### GET `/comments/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ取得可能

#### Response

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
    "total": 1
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

#### Response

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
    "limit": 50,
    "total": 100
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
- Issue変更履歴管理
- Comment変更履歴管理
- 状態遷移制御
- 実務運用を想定した監査性を重視

---
