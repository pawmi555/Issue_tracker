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

#### エラーコード例

| code              | 内容                 |
| ----------------- | -------------------- |
| USER_NOT_FOUND    | ユーザー不存在       |
| PROJECT_FORBIDDEN | プロジェクト権限なし |
| ISSUE_CLOSED      | クローズ済み         |
| VALIDATION_ERROR  | 入力エラー           |
| UNAUTHORIZED      | 未認証               |

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

| Middleware            | 役割                    |
| --------------------- | ----------------------- |
| authMiddleware        | JWT認証                 |
| adminMiddleware       | ADMINのみ許可           |
| userOwnerMiddleware   | 自分とADMINのみ許可     |
| projectRoleMiddleware | ProjectRole権限チェック |
| requireRole           | RBAC認可                |
| validateMiddleware    | Zod validation          |
| requestLogger         | APIログ                 |
| errorMiddleware       | 共通エラーハンドリング  |
| notFoundMiddleware    | 404エラー処理           |

---

## include設計

```http
?include=assignee,reporter
```

#### 制約

- ホワイトリスト制
- 最大3件

#### include whitelist

| resource |
| -------- |
| assignee |
| reporter |
| comments |

```json
{
  "id": 1,
  "title": "xxx",
  "assignee": {
    "id": 1,
    "name": "user"
  },
  "reporter": {...},
  "comments": [...]
}
```

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

### IssuePriority

| name     | 説明           |
| -------- | -------------- |
| LOW      | 低             |
| MEDIUM   | 中             |
| HIGH     | 高             |
| CRITICAL | 緊急・重大障害 |

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

- プロジェクト作成（project + member）
- Issue更新（履歴作成含む）
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
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

---

### 7.1.3 トークン再発行

#### POST `/auth/refresh`

#### 制約

- トークンローテーション
- 不正検知時は全revoke

#### Request

```json
{
  "refreshToken": "jwt..."
}
```

#### Response

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

---

### 7.1.4 ログアウト

#### POST `/auth/logout`

#### 制約

- RefreshToken revoke

---

### 7.1.5 自分情報取得

#### GET `/auth/me`

#### 制約

- 自分の情報のみ取得可能

---

## 7.2. User API

### 7.2.1 ユーザー一覧

#### GET `/users?page=1&limit=20`

#### 制約

- ADMIN

---

### 7.2.2 ユーザー詳細

#### GET `/users/:id`

#### 制約

- 自分 or ADMINのみ

---

### 7.2.3 ユーザー更新

#### PATCH `/users/:id`

#### 制約

- 自分 or ADMINのみ

#### Request

```json
{
  "name": "New Name"
}
```

---

### 7.2.4 ユーザー削除

#### DELETE `/users/:id`

#### 制約

- 論理削除
- ADMIN

---

## 7.3 Project API

### 7.3.1 プロジェクト作成

### POST `/projects`

#### 制約

- ownerId = ログインユーザー
- Project作成時に、作成者をProjectMemberへOWNER権限で自動追加
- OWNERは最低1人必要
- 最後のOWNER削除禁止
- 同一ユーザー内で project.name は一意
- トランザクション必須
- 論理削除済みProjectは対象外

#### Request

```json
{
  "name": "Issue Tracker",
  "description": "社内管理ツール"
}
```

---

### 7.3.2 プロジェクト一覧取得

### GET `/projects?page=1&limit=20`

#### 制約

- 自分が所属するプロジェクトのみ

---

### 7.3.3 プロジェクト詳細

### GET `/projects/:id`

#### 制約

- メンバーのみ

---

### 7.3.4 プロジェクト更新

### PATCH `/projects/:id`

#### 制約

- MANAGER以上

#### Request

```json
{
  "name": "Updated Project"
}
```

---

### 7.3.5 プロジェクト削除

### DELETE `/projects/:id`

#### 制約

- OWNER

---

## 7.4. Project Member API

### 7.4.1 メンバー追加

### POST `/projects/:id/members`

#### 制約

- userは存在必須
- project所属チェック
- UNIQUE(projectId, userId)
- MANAGER以上

#### Request

```json
{
  "userId": 3,
  "role": "MEMBER"
}
```

---

### 7.4.2 メンバー一覧

### GET `/projects/:id/members`

#### 制約

- MANAGER以上

---

### 7.4.3 メンバー権限変更

### PATCH `/projects/:id/members/:userId`

#### 制約

- MANAGER以上

#### Request

```json
{
  "role": "MEMBER"
}
```

---

### 7.4.4 メンバー削除

### DELETE `/projects/:id/members/:userId`

#### 制約

- OWNER

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
- include最大3件
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

---

### 7.6.3 コメント更新

### PATCH `/comments/:id`

#### Request

#### 制約

- 投稿者のみ

```json
{
  "content": "修正版コメント"
}
```

---

### 7.6.4 コメント削除

### DELETE `/comments/:id`

#### 制約

- 投稿者 or MANAGER

---

## 7.7 History API

### 7.7.1 Issue履歴一覧

### GET `/issues/:id/histories?page=1&limit=20`

#### 制約

- プロジェクトメンバーのみ

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
- statusCode
- responseTime

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

---
