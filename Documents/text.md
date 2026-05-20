# 最小ドメイン
'''text
User
Project
Issue
Comment
'''

# ドメイン（業務ルール）仕様
'''text
・すべての操作は認証済みUserによって実行される

・Userは複数のProjectに所属できる
・Projectは1人のownerを持つ
・UserはProjectごとにrole（owner / member / guest）を持つ
・Projectは1人以上のmemberを持つ（owner含む）

・Projectはownerのみがmemberを追加できる

・Issueは必ずProjectに属する
・Issueは1人の作成者（author）を持つ
・Issueの作成者はProjectに所属するUserのみ

・Issueはassigneeを持つ（nullable）
・assigneeはProjectに属するUserのみ

・Issueはstatus（OPEN / IN_PROGRESS / DONE）を持つ
・statusは OPEN → IN_PROGRESS → DONE の順で遷移する

・Issueはpriority（LOW / MEDIUM / HIGH）を持つ

・IssueはCommentを0以上持つ
・CommentはIssueに紐づく
・Commentは1人の作成者を持つ
・Commentの作成者はProjectに所属するUserのみ

・ProjectのmemberのみIssueを作成できる
・Issueの作成者またはProjectのownerのみIssueを更新・削除できる
・Project memberのみCommentを作成できる

・Project削除時、Issueは削除される（方針は後で決定）
・Issue削除時、Commentは削除される（方針は後で決定）

・Userのemailは一意

・User / Project / Issue / Comment は createdAt / updatedAt を持つ
'''


## 転職用の「合格ライン」を定義
バックエンド採用で評価されるのは主に以下：

DB設計（正規化・リレーション）
API設計（REST + エラー設計）
認証・認可
アーキテクチャ（責務分離）
非機能（ログ・パフォーマンス意識）

👉 UIや機能の多さは優先度が低い

## IssueTrackerの“適正スコープ”を決める
### ■ 必須（これがないと落ちる）

ここだけまず作る

### 認証
- register / login（JWT）

### Issue管理
- 作成
- 一覧
- 詳細
- 更新
- 削除

### 紐付け
- Issue → User（作成者）
- Issue → Project

### ■ 加点（ここで差がつく）

余力があれば実装

- Project機能
- Comment
- 権限制御（owner / member）
- 検索・フィルタ
- ページネーション

### ■ 捨てていい（今は不要）
- 通知
- リアルタイム更新
- UIの作り込み