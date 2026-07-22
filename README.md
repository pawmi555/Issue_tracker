# 1. Overview

Issue Trackerは、チーム開発におけるIssue管理を想定したREST APIです。
単純なCRUD APIではなく、実際の業務システムで求められる認証・認可・監査・履歴管理・論理削除・状態遷移制御を考慮して設計・実装しました。
API設計ではDTOとMapperによるAPI契約の分離、RBACによる認可、Refresh Token Rotationによる認証、履歴管理による監査性など、保守性・拡張性・セキュリティを重視しています。

## Design Principles

本プロジェクトでは以下の方針で設計しています。

- DTOによるAPI契約固定
- MapperによるEntity分離
- Repositoryによる履歴データ参照処理の分離
- Role Based Access Control
- Soft Delete
- History Table
- Refresh Token Rotation
- Transactionによる整合性維持

# 2. Features

## Authentication

- JWT Access Token認証
- Refresh Token Rotation
- Refresh TokenのHash保存
- 失効済みRefresh Token再利用検知
- HttpOnly CookieによるRefresh Token管理

## Authorization

- RBAC(Role Based Access Control)
- User Roleによる権限制御
- Project Roleによるプロジェクト単位の権限制御

Project Role:

| Role    | Permission                             |
| ------- | -------------------------------------- |
| OWNER   | プロジェクトの最高権限。複数人設定可能 |
| MANAGER | メンバー管理・Issue管理が可能          |
| MEMBER  | Issue作成・更新・コメント可能          |
| VIEWER  | 閲覧のみ                               |

## Project Management

- Project CRUD
- Project Member管理
- Member Role変更
- Project単位アクセス制御

## Issue Management

- Issue CRUD
- Issue Status管理
- Status Transition制御
- Priority管理
- Assignee管理

## Comment Management

- Comment CRUD

## Audit / History

- User、Project、Issue、Comment変更履歴の記録・参照
- 更新前後データ(JSON)保持
- DTO/Mapperによる公開用データ変換
- 内部値とAPI公開値を分離

## Data Management

- Pagination
- Soft Delete
- Restore
- Include Query
- Validation

### Deleted Data Management

削除済みデータの取得・復元APIは実装済みです。
フロントエンドの削除済みデータ管理画面は、初期リリースの対応範囲に含めていません。

# 3. Tech Stack

## Backend

| Technology     | Purpose            |
| -------------- | ------------------ |
| TypeScript     | Type Safety        |
| Node.js        | Runtime            |
| Express        | REST API Framework |
| Prisma         | ORM                |
| PostgreSQL     | Database           |
| Zod            | Validation         |
| JWT            | Authentication     |
| Docker         | Container Runtime  |
| Docker Compose | Local Development  |

## Frontend

| Technology | Purpose     |
| ---------- | ----------- |
| React      | UI          |
| TypeScript | Type Safety |

## Development Tools

| Tool           | Purpose           |
| -------------- | ----------------- |
| Postman        | API Testing       |
| Docker Compose | Local Environment |
| Git            | Version Control   |

# 4. Architecture

## System Architecture

```mermaid
flowchart LR

Client[React Client]

API[Express API]

Service[Service Layer]

Prisma[Prisma ORM]

DB[(PostgreSQL)]

Client --> API
API --> Service
Service --> Prisma
Prisma --> DB
```

## Backend Layer

```mermaid
flowchart TD

Controller --> Service

Service --> Prisma

Service --> HistoryRepository

HistoryRepository --> Prisma

Prisma --> Database
```

責務分離:

- Controller
  - HTTP Request / Response管理

- Service
  - Business Logic
  - Transaction制御
  - Prismaを利用したEntity操作
  - Entity変更時のHistory Record作成制御
  - History Repositoryを利用した履歴参照

- Repository
  - 履歴データの参照処理を担当
  - 履歴一覧取得
  - Pagination用件数取得
  - 履歴表示変換用Master取得
  - Prisma QueryをService層から分離
  - 読み取り専用のQuery Repositoryとして実装

- Mapper
  - EntityからDTOへの変換

# 5. Authentication / Authorization

## JWT Authentication

Access TokenとRefresh Tokenを分離しています。

### Access Token

- API Authorization Headerで送信
- 短期間有効
- Client Memoryで保持
- XSSリスクを考慮しLocalStorageには保存しない

### Refresh Token

- HttpOnly Cookie保存
- DBにはHash化して保存
- Token Rotation採用

## Refresh Token Rotation

Refresh Token更新時:

1. 既存Tokenを失効
2. 新しいRefresh Token発行
3. Token Chainを保存

不正利用対策:

- Token Chainを利用してRefresh Tokenの世代管理を行っています。
- 失効済みRefresh Tokenの再利用を検知した場合は、そのユーザーが保持する有効なRefresh Tokenをすべて失効させ、トークン盗難による不正利用を防止します。

## Authorization

RBACを採用しています。

User Role:

- ADMIN
- USER

Project Role:

- OWNER
- MANAGER
- MEMBER
- VIEWER

ユーザー権限だけではなく、プロジェクト単位でアクセス制御を行っています。

### ADMINとProject権限

システムロールがADMINであっても、Project内の操作には
対象Projectへの所属が必要です。

Project内の実際の操作権限は、
ProjectMemberに設定されたProjectRoleによって判定します。

ADMINはProjectRoleによる認可をスキップしません。

# 6. Database Design

```mermaid
erDiagram

users {
  int id PK
  string name
  string email
  string passwordHash
  int roleId
  datetime createdAt
  datetime updatedAt
  datetime deletedAt
}

user_roles {
  int id PK
  string name
  string label
}

projects {
  int id PK
  int ownerId FK
  string name
  string description "nullable"
  datetime createdAt
  datetime updatedAt
  datetime deletedAt
}

project_members {
  int id PK
  int userId FK
  int projectId FK
  int roleId FK
  datetime createdAt
  datetime updatedAt
}

project_roles {
  int id PK
  string name
  string label
}

issues {
  int id PK
  int projectId FK
  int reporterId FK
  int assigneeId FK "nullable"
  int statusId FK
  int priorityId FK
  string title
  string description
  datetime dueDate
  datetime createdAt
  datetime updatedAt
  datetime deletedAt
}

issue_statuses {
  int id PK
  string name
  string label
  int sortOrder
}

issue_priorities {
  int id PK
  string name
  string label
  int sortOrder
}

comments {
  int id PK
  int issueId FK
  int userId FK
  string content
  datetime createdAt
  datetime updatedAt
  datetime deletedAt
}

history_actions {
  int id PK
  string name
  string label
  int sortOrder
}

user_histories {
  int id PK
  int userId FK
  int operatedBy FK
  int actionId FK
  string fieldName
  json oldValue
  json newValue
  datetime createdAt
}

project_histories {
  int id PK
  int projectId FK
  int userId FK
  int actionId FK
  string fieldName
  json oldValue
  json newValue
  datetime createdAt
}

issue_histories {
  int id PK
  int issueId FK
  int userId FK
  int actionId FK
  string fieldName
  json oldValue
  json newValue
  datetime createdAt
}

comment_histories {
  int id PK
  int commentId FK
  int userId FK
  int actionId FK
  string fieldName
  json oldValue
  json newValue
  datetime createdAt
}

refresh_tokens {
  int id PK
  string jti
  int userId FK
  string tokenHash
  datetime expiresAt
  string replacedByTokenId
  datetime revokedAt
  datetime createdAt
}

api_logs {
  int id PK
  string requestId
  int userId FK
  string method
  string path
  int status
  int duration
  datetime createdAt
}

user_roles ||--o{ users : has

users ||--o{ projects : owns

users ||--o{ project_members : joins
projects ||--o{ project_members : has
project_roles ||--o{ project_members : defines

projects ||--o{ issues : has
users ||--o{ issues : reports
users ||--o{ issues : assigned
issue_statuses ||--o{ issues : defines
issue_priorities ||--o{ issues : defines

issues ||--o{ comments : has
users ||--o{ comments : writes

users ||--o{ user_histories : target
users ||--o{ user_histories : operates
history_actions ||--o{ user_histories : defines

projects ||--o{ project_histories : has
users ||--o{ project_histories : has
history_actions ||--o{ project_histories : defines

issues ||--o{ issue_histories : has
users ||--o{ issue_histories : has
history_actions ||--o{ issue_histories : defines

comments ||--o{ comment_histories : has
users ||--o{ comment_histories : has
history_actions ||--o{ comment_histories : defines

users ||--o{ refresh_tokens : has

users ||--o{ api_logs : has
```

## Database

- PostgreSQL

## ORM

- Prisma

## Major Entities

- User
- UserRole
- Project
- ProjectMember
- Issue
- Comment
- ProjectHistory
- HistoryAction
- UserHistory
- IssueHistory
- CommentHistory
- RefreshToken

設計方針:

- Role管理をMaster Table化
- Project Memberによるアクセス制御
- History Tableによる監査情報保持
- Refresh TokenをDB管理
- Soft Deleteによるデータ保持

Database Designでは以下を重視しました。

- Master Tableによるコード値管理
- Soft Deleteによるデータ保持
- History Tableによる監査性
- 正規化を基本としたテーブル設計
- FK制約による整合性維持

※ api_logsは将来的な運用監視機能向けに設計のみ実施しています。
※ History Tableは業務データ変更監査用途、api_logsはシステムアクセス監視用途として役割を分離しています。

# 7. Security

- Password Hashing（bcrypt）
- JWT Authentication
- Refresh Token Rotation
- HttpOnly Cookie
- RBAC
- Input Validation(Zod)
- SQL Injection Prevention(Prisma)
- Refresh Token Hash Storage
- Token Reuse Detection
- Soft Delete Data Protection
- Transaction Integrity Control

# 8. Directory Structure

```text
src
├── config
├── constants
├── controllers
├── dto
│ ├── auth
│ ├── comment
│ ├── common
│ ├── history
│ ├── issue
│ ├── project
│ └── user
├── lib
├── mappers
│ ├── auth
│ ├── comment
│ ├── history
│ ├── issue
│ ├── project
│ └── user
├── middlewares
├── repositories
├── routes
├── selects
├── services
│ └── builders
├── types
├── utils
└── validators
```

Layer責務:

- controllers
  - HTTP Request / Response

- services
  - Business Logic

- repositories
  - History Query Abstraction
  - History Repository
    - 履歴参照処理を担当
    - 履歴一覧取得
    - Pagination用件数取得
    - 表示変換用Master取得
  - Database Access Layer
  - History関連データ取得処理

- mappers
  - Entity / DTO Conversion

- validators
  - Request Validation

# 9. API Design

REST APIとして設計しています。

Base URL:

```
/api/v1
```

主なAPI:

| Resource  | Description              |
| --------- | ------------------------ |
| Auth      | Login / Refresh / Logout |
| Users     | User Management          |
| Projects  | Project Management       |
| Issues    | Issue Management         |
| Comments  | Comment Management       |
| Histories | History Management       |

設計方針:

- DTOによるResponse Contract管理
- MapperによるResponse整形
- ZodによるRequest Validation
- 共通Error Response
- Pagination対応

API設計では以下を重視しました。

- RESTful API
- DTOによるAPI契約固定
- MapperによるEntity分離
- 共通レスポンス形式
- エラーコード統一
- Pagination
- Include Queryによる関連データ取得
- Soft Delete対応

※ History APIはIssue Historyを中心にPhase1で実装しています。

# 10. Testing

## API Testing

Tool:

- Postman

Test Coverage:

Postman Collection:

```text
Issue Tracker Collection
│
├ 00 Setup
│ ├ Reset DB
│ └ Get Access Token
│
├ 01 Auth
│ ├ Login
│ ├ Refresh
│ ├ Me
│ └ Logout
│
├ 02 Projects
│ ├ Create
│ ├ List
│ ├ Detail
│ └ Detail (includeDeleted)
│
├ 03 Issues
│ ├ Create
│ ├ Update Success
│ ├ Update Invalid Transition
│ ├ Delete
│ ├ Restore
│ ├ Detail
│ ├ Detail (include)
│ ├ Prepare Closed Issue
│ │ ├ Move To REVIEW
│ │ ├ Move To DONE
│ │ └ Move To CLOSED
│ └ Update Closed Issue
│
└ 04 Histories
└ Issue History
```

## Tested Scenarios

- ✅ Authentication
- ✅ Authorization
- ✅ CRUD
- ✅ Validation
- ✅ Status Transition
- ✅ Soft Delete
- ✅ Restore
- ✅ History Recording
- ✅ Refresh Token Rotation
- ✅ Include Query
- ✅ Pagination

### テスト実行前

Postmanテストで使用する開発DBを初期化し、開発用Seedデータを登録します。

```bash
docker compose -f docker/docker-compose.dev.yml exec app npm run db:fresh
```

このコマンドは開発DBのデータを削除して再作成します。必要なデータが残っていないことを確認してから実行してください。

テストでは正常系だけではなく、

権限エラー
不正状態遷移
論理削除状態
Token更新

など業務システムで発生するケースを確認しています。

# 11. Environment Setup

## Requirements

- Node.js v22 LTS
- Docker
- Docker Compose
- Git

## Development Environment

- TypeScript strict modeによる型安全性確保
- ESLintによる静的解析
- Prettierによるコードフォーマット統一
- Docker Composeによる開発環境構築

### 1. Clone repository

```bash
git clone https://github.com/pawmi555/Issue_tracker.git
cd Issue_tracker
```

### 2. Create environment files

バックエンドとフロントエンドの環境変数ファイルを作成します。

#### PowerShell

```powershell
Copy-Item app/.env.example app/.env
Copy-Item frontend/.env.example frontend/.env
```

#### macOS / Linux / Git Bash

```bash
cp app/.env.example app/.env
cp frontend/.env.example frontend/.env
```

必要に応じて、作成した`.env`の値を変更してください。

### 3. Build and start containers

```bash
docker compose -f docker/docker-compose.dev.yml up --build -d
```

バックエンドの起動時に、Prisma Migrationが自動的に実行されます。

### 4. Insert development seed data

```bash
docker compose -f docker/docker-compose.dev.yml exec app npm run db:seed
```

### 5. Check containers

```bash
docker compose -f docker/docker-compose.dev.yml ps
```

次のURLへアクセスします。

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/v1`

### 6. Stop containers

```bash
docker compose -f docker/docker-compose.dev.yml down
```

## Production-like Environment

Docker Composeを使用して、本番用Dockerfileによる動作をローカルで確認できます。

この構成では、フロントエンドをNginxで配信し、バックエンド起動時にPrisma Migrationと必須マスターデータの投入を実行します。

### 1. Create the production environment file

サンプルファイルをコピーして、本番相当環境用の環境変数ファイルを作成します。

#### PowerShell

```powershell
Copy-Item app/.env.production.example app/.env.production
```

#### macOS / Linux / Git Bash

```bash
cp app/.env.production.example app/.env.production
```

`app/.env.production`の例：

```dotenv
NODE_ENV=production

POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=issue_prod_db
DATABASE_URL=postgresql://postgres:change_me@db:5432/issue_prod_db

JWT_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret

PORT=3000

FRONTEND_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

実際のパスワードやJWT Secretは、十分に長いランダムな値へ変更してください。

`app/.env.production`には秘密情報が含まれるため、Gitへコミットしないでください。

### 2. Frontend API URL

フロントエンドが接続するバックエンドAPIのURLは、`VITE_API_BASE_URL`で指定します。

ローカルで本番相当環境を確認する場合：

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

`VITE_API_BASE_URL`は、フロントエンドのDockerイメージをビルドするときにViteによってJavaScriptへ埋め込まれます。

そのため、値を変更した場合はフロントエンドイメージの再ビルドが必要です。

```bash
docker compose --env-file app/.env.production -f docker/docker-compose.prod.yml build --no-cache frontend
```

`VITE_API_BASE_URL`には、ブラウザからアクセス可能なURLを指定してください。

次のようなDocker Compose内部のサービス名は、ブラウザから通常アクセスできないため指定しません。

```dotenv
# Do not use this URL from the browser
VITE_API_BASE_URL=http://app:3000/api/v1
```

### 3. CORS configuration

バックエンドが許可するフロントエンドのOriginは、`FRONTEND_URL`で指定します。

ローカルでフロントエンドを`http://localhost:8080`に公開する場合：

```dotenv
FRONTEND_URL=http://localhost:8080
```

`FRONTEND_URL`とブラウザでアクセスするフロントエンドのOriginは一致させてください。

| Environment variable | Purpose                                          | Local production-like value    |
| -------------------- | ------------------------------------------------ | ------------------------------ |
| `FRONTEND_URL`       | バックエンドがCORSで許可するフロントエンドOrigin | `http://localhost:8080`        |
| `VITE_API_BASE_URL`  | ブラウザが接続するバックエンドAPIのBase URL      | `http://localhost:3000/api/v1` |

### 4. Validate the Docker Compose configuration

Docker Composeが環境変数を正しく読み込めることを確認します。

```bash
docker compose --env-file app/.env.production -f docker/docker-compose.prod.yml config
```

出力された設定で、フロントエンドのビルド引数が次のようになっていることを確認します。

```yaml
frontend:
  build:
    args:
      VITE_API_BASE_URL: http://localhost:3000/api/v1
```

このコマンドの出力には環境変数の値が含まれることがあります。実行結果をIssueやREADMEへ貼り付ける場合は、秘密情報を削除してください。

### 5. Build and start containers

```bash
docker compose --env-file app/.env.production -f docker/docker-compose.prod.yml up --build -d
```

バックエンドコンテナの起動時に、次の処理が順番に実行されます。

1. PostgreSQLの接続待機
2. Prisma Migrationの適用
3. 必須マスターデータの投入
4. バックエンドAPIの起動

### 6. Check containers

```bash
docker compose --env-file app/.env.production -f docker/docker-compose.prod.yml ps
```

すべてのコンテナが起動していることを確認します。

```text
IssueTracker_db_prod         healthy
IssueTracker_app_prod        running
IssueTracker_frontend_prod   running
```

次のURLへアクセスします。

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000/api/v1`

### 7. Create a test user via API

本番相当環境では、Master SeedによってRole、Project Role、Issue Statusなどの必須マスターデータのみを登録します。

開発用Seedに含まれるテストユーザーやサンプルデータは登録されません。

フロントエンドのユーザー登録画面は、現在の公開範囲には含まれていません。そのため、初回起動後にユーザー登録APIを使用して確認用ユーザーを作成してください。

#### PowerShell

```powershell
$registerBody = @{
  name = "Production Test User"
  email = "prod-test@example.com"
  password = "password123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $registerBody
```

#### macOS / Linux / Git Bash

```bash
curl -X POST "http://localhost:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Test User",
    "email": "prod-test@example.com",
    "password": "password123"
  }'
```

登録に成功すると、作成したユーザーにはシステムロールの`USER`が自動的に設定されます。

登録後、`http://localhost:8080`を開き、次の認証情報でログインしてください。

```text
Email: prod-test@example.com
Password: password123
```

上記の認証情報は、ローカルの本番相当環境における動作確認専用です。実際の公開環境では、十分に安全なパスワードを使用してください。

同じメールアドレスがすでに登録されている場合は、別のメールアドレスを使用するか、既存ユーザーでログインしてください。

### 8. Verify the frontend API connection

ブラウザで`http://localhost:8080`を開き、開発者ツールのNetworkタブでAPIのRequest URLを確認します。

ログインAPIの期待URL：

```text
http://localhost:3000/api/v1/auth/login
```

確認項目：

- ログインAPIのRequest URLが正しい
- ログインAPIが`404 Not Found`にならない
- ログイン後にバックエンドAPIへ接続できる
- CORSエラーが発生しない
- `/auth/me`が成功する
- Project一覧APIが実行される

ログイン前に有効なRefresh Token Cookieが存在しない場合、`POST /auth/refresh`が`401 Unauthorized`を返すことがあります。ログイン後のAPI通信が成功する場合、この初回の`401`は想定内です。

### 9. Check backend logs

```bash
docker compose --env-file app/.env.production -f docker/docker-compose.prod.yml logs --tail=100 app
```

正常起動時には、次の処理がエラーなく完了していることを確認します。

- PostgreSQLへの接続待機が完了している
- Prisma Migrationが正常終了している
- Master Seedが正常終了している
- バックエンドがDBへ接続できている
- バックエンドサーバーがポート3000で起動している

Migration適用済みの場合のログ例：

```text
Database is ready.
No pending migrations to apply.
Master seed completed.
Database connected.
Server started on port 3000
```

新規DBでは、`No pending migrations to apply.`の代わりにMigrationの適用結果が表示されます。

### 10. Stop containers

```bash
docker compose --env-file app/.env.production -f docker/docker-compose.prod.yml down
```

DBの永続ボリュームは通常の`down`では削除されません。

ボリュームを削除すると本番相当環境のDBデータが失われるため、`down -v`はDBを初期化する必要がある場合に限って使用してください。

# 12. Future Improvements

## Phase2

- API Request Log API
- Admin Dashboard
- Operation Monitoring

## Additional

- Automated Test
- CI/CD Pipeline
- Notification Feature
- Real-time Update(WebSocket)

# 13. Author

GitHub: https://github.com/pawmi555
Portfolio: https://github.com/pawmi555/Issue_tracker
