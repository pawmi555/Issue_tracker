# Issue Tracker API設計書

---

# 1. 概要

Issue管理システムのREST API設計書。

## 対象機能

- 認証（JWT + Refresh Token）
- ユーザー管理
- プロジェクト管理
- プロジェクトメンバー管理
- Issue管理
- コメント管理
- 履歴管理
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

## 共通レスポンス

### 成功

```json
{
  "success": true,
  "data": {}
}
```

### 失敗

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "詳細メッセージ"
}
```

#### エラーコードルール

##### 形式

RESOURCE_REASON

##### 例

| code                  | status | 内容                       |
| --------------------- | ------ | -------------------------- |
| USER_NOT_FOUND        | 404    | ユーザー不存在             |
| PROJECT_NOT_FOUND     | 404    | プロジェクト不存在         |
| PROJECT_FORBIDDEN     | 403    | プロジェクト権限なし       |
| ISSUE_NOT_FOUND       | 404    | Issue不存在                |
| COMMENT_NOT_FOUND     | 404    | コメント不存在             |
| ISSUE_CLOSED          | 409    | クローズ済みのため更新不可 |
| INVALID_REFRESH_TOKEN | 401    | 無効または失効したトークン |
| VALIDATION_ERROR      | 422    | 入力エラー                 |
| UNAUTHORIZED          | 401    | 未認証                     |

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
| 409  | 重複                 |
| 422  | バリデーションエラー |
| 500  | サーバーエラー       |

---

## Pagination

#### Response

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

制約:

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

- GET /issues
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

# 4. Master定義

### UserRole

| name  | 説明                                             |
| ----- | ------------------------------------------------ |
| ADMIN | 管理者。全ユーザー管理・全プロジェクト管理が可能 |
| USER  | 一般ユーザー                                     |

---

### ProjectRole

| name    | 説明                          |
| ------- | ----------------------------- |
| OWNER   | プロジェクト作成者。全権限    |
| MANAGER | メンバー管理・Issue管理が可能 |
| MEMBER  | Issue作成・更新・コメント可能 |
| VIEWER  | 閲覧のみ                      |

---

### IssueStatus

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

### IssuePriority

| name     | 説明           |
| -------- | -------------- |
| LOW      | 低             |
| MEDIUM   | 中             |
| HIGH     | 高             |
| CRITICAL | 緊急・重大障害 |

---

### ProjectHistory

プロジェクト変更履歴を保持する。

#### 保存対象

- name
- description

#### 保存内容

- fieldName
- oldValue
- newValue
- userId
- createdAt

### IssueHistory

Issue変更履歴を保持する。

#### 保存対象

- title
- description
- statusId
- priorityId
- assigneeId
- dueDate
- deleted

#### 保存内容

- fieldName
- oldValue
- newValue
- userId
- createdAt

---

### CommentHistory

コメント変更履歴を保持する。

#### 保存対象

- content

#### 保存内容

- fieldName
- oldValue
- newValue
- userId
- createdAt

---

## ソフトデリート

```http
?includeDeleted=true/false
```

#### 制約

- 明示的に指定しない限り表示しない

```ts
where: {
  deletedAt: null,
  project: {
    deletedAt: null
  }
}
```

---

## バリデーション方針

- Zod使用
- DB存在チェック必須
- 外部キー整合性チェック必須

---

# 5. 認可設計

## 原則

- **ユーザーは所属プロジェクトのデータのみアクセス可能**
- **ユーザー情報は自分 or ADMINのみ取得可能**
- **ADMINは全リソースアクセス可能**
- **OWNERはプロジェクト削除可能**
- **VIEWERは更新不可**

---

# 6. トランザクション方針

以下はトランザクション必須：

- Project更新（履歴作成含む）
- Issue更新（履歴作成含む）
- Comment更新（履歴作成含む）
- Refresh Token更新

---

# 7. API一覧

## 7.1 Auth API

### 7.1.1 ユーザー登録

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

### 7.1.2 ログイン

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
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

---

### 7.1.3 トークン再発行

#### POST `/auth/refresh`

#### 制約

- Refresh Token Rotation採用
- DBにはハッシュ化して保存
- 使用済みRefresh Tokenは失効
- 新しいRefresh Tokenを発行
- replacedByTokenでトークンチェーンを保持
- 失効済みTokenの再利用を検知した場合は全Refresh Tokenをrevoke

#### Request

```json
{
  "refreshToken": "jwt..."
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

---

### 7.1.4 ログアウト

#### POST `/auth/logout`

#### 制約

- RefreshToken revoke

#### Request

```json
{
  "refreshToken": "jwt"
}
```

#### Response

```json
{
  "success": true
}
```

---

### 7.1.5 自分情報取得

#### GET `/auth/me`

#### 制約

- 自分の情報のみ取得可能

#### Request

```json
{
  "refreshToken": "jwt"
}
```

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

## 7.2. User API

### 7.2.1 ユーザー一覧

#### GET `/users?page=1&limit=20`

#### 制約

- ADMINのみ

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

### 7.2.2 ユーザー詳細

#### GET `/users/:id`

#### 制約

- 自分 or ADMINのみ

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

### 7.2.3 ユーザー更新

#### PATCH `/users/:id`

#### 制約

- 自分 or ADMINのみ

#### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "New Name",
    "email": "new@test.com",
    "createdAt": "2026-05-01T10:00:00.000Z",
    "updatedAt": "2026-06-09T06:40:16.979Z"
  }
}
```

---

### 7.2.4 ユーザー削除

#### DELETE `/users/:id`

#### 制約

- 論理削除
- ADMINのみ

#### Response

204 No Content

---

## 7.3 Project API

### 7.3.1 プロジェクト作成

### POST `/projects`

#### 制約

- ownerId = ログインユーザー
- Project作成時に、作成者をProjectMemberへOWNER権限で自動追加
- 同一ユーザー内で project.name は一意

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

### 7.3.2 プロジェクト一覧取得

### GET `/projects?page=1&limit=20`

#### 制約

- 自分が所属するプロジェクトのみ

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

### 7.3.3 プロジェクト詳細

### GET `/projects/:id`

#### 制約

- メンバーのみ

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

### 7.3.4 プロジェクト更新

### PATCH `/projects/:id`

#### 制約

- MANAGER以上
- Project作成履歴を作成
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
    "name": "sample application",
    "description": "updated",
    "createdAt": "2026-06-11T06:35:31.672Z",
    "updatedAt": "2026-06-11T06:35:40.013Z"
  }
}
```

---

### 7.3.5 プロジェクト削除

### DELETE `/projects/:id`

#### 制約

- OWNERのみ
- 論理削除

#### Response

204 No Content

---

## 7.4. Project Member API

### 7.4.1 メンバー追加

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

### 7.4.2 メンバー一覧

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

### 7.4.3 メンバー権限変更

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

### 7.4.4 メンバー削除

### DELETE `/projects/:id/members/:userId`

#### 制約

- ログインユーザーが対象ProjectのMANAGER以上であること
- OWNERメンバーの削除はOWNERのみ可能
- OWNERは最低1人必要
- 最後のOWNER削除禁止
- 物理削除

#### Response

204 No Content

---

## 7.5 Issue API

### 7.5.1 Issue作成

### POST `/projects/:projectId/issues`

#### 制約

- projectメンバーのみ
- assigneeはメンバー限定
- priority/status存在チェック

#### Request

```json
{
  "title": "ログインできない",
  "description": "500 error",
  "priorityId": 1,
  "statusId": 1,
  "assigneeId": 2,
  "dueDate": "2026-05-01"
}
```

---

### 7.5.2 Issue一覧取得

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
- MEMBER以上

---

### 7.5.3 Issue詳細取得

## GET `/issues/:id`

#### 制約

- プロジェクトメンバーのみ

---

### 7.5.4 Issue更新

### PATCH `/issues/:id`

#### 制約

- assignee or MANAGER以上
- statusがCLOSEDは更新不可
- reporterId変更不可

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

---

### 7.5.5 Issue削除

### DELETE `/issues/:id`

- 論理削除
- MANAGER以上

#### Response

204 No Content

---

### 7.5.6 Issue復元

### POST `/issues/:id/restore`

#### 制約

- deletedAt != null
- project削除済みなら不可
- 削除済みIssueのみ復元可能
- CLOSEDは復元不可
- MANAGER以上

---

## 7.6 Comment API

### 7.6.1 コメント投稿

### POST `/issues/:id/comments`

#### 制約

- プロジェクトメンバーのみ

#### Request

```json
{
  "content": "調査します"
}
```

---

### 7.6.2 コメント一覧

### GET `/issues/:id/comments?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ
- ソート順は createdAt ASC

---

### 7.6.3 コメント更新

### PATCH `/comments/:id`

#### Request

#### 制約

- 投稿者 or MANAGER以上
- 更新時はCommentHistory作成
- トランザクション必須

```json
{
  "content": "修正版コメント"
}
```

---

### 7.6.4 コメント削除

### DELETE `/comments/:id`

#### 制約

- 投稿者 or MANAGER以上
- 論理削除

#### Response

204 No Content

---

## 7.7 History API

### 7.7.1 Project履歴一覧

### GET `/projects/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ

#### Response

```json
{
  "success": true,
  "data": [
    {
      "fieldName": "description",
      "oldValue": "Issue管理システム",
      "newValue": "社内Issue管理システム",
      "createdAt": "2026-04-26T12:00:00Z"
    }
  ]
}
```

### 7.7.2 Issue履歴一覧

### GET `/issues/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ

#### Response

```json
{
  "success": true,
  "data": [
    {
      "fieldName": "status",
      "oldValue": "OPEN",
      "newValue": "DONE",
      "createdAt": "2026-04-26T12:00:00Z"
    }
  ]
}
```

---

### 7.7.3 Comment履歴一覧

### GET `/comments/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ

#### Response

```json
{
  "success": true,
  "data": [
    {
      "fieldName": "content",
      "oldValue": "調査します",
      "newValue": "調査完了しました",
      "createdAt": "2026-04-26T12:00:00Z"
    }
  ]
}
```

---

## 7.8 Internal API

### 7.8.1 APIログ一覧

### GET `/admin/logs?page=1&limit=50`

#### 制約

- ADMINのみ

#### ログ方針

- 全API記録
- requestId
- method
- path
- userId
- status
- duration

---

# 8. セキュリティ

- パスワードはハッシュ化
- JWT短命 + RefreshToken
- 不正時全revoke
- 入力バリデーション必須

---

# 9. 参考資料

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
- SoftDelete採用
- Issue変更履歴管理
- Comment変更履歴管理
- 状態遷移制御
- 実務運用を想定した監査性を重視

---
