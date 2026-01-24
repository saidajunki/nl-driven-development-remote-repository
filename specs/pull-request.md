# Pull Request 仕様

## 目的

- ブランチ間の変更をレビュー・マージするための仕組みを提供する。
- コードレビューのワークフローを支援する。

## 機能一覧

### PR 作成

- ソースブランチとターゲットブランチを指定
- タイトルと説明を入力
- 変更差分（diff）のプレビュー

### PR 一覧

- リポジトリ内の PR を一覧表示
- ステータスでフィルタ（Open / Closed / Merged）

### PR 詳細

- 変更ファイル一覧
- 差分表示（unified diff）
- コミット一覧

### PR マージ

- マージ方法の選択
  - Merge commit
  - Squash and merge
  - Rebase and merge（将来実装）
- コンフリクト検出

### PR クローズ

- マージせずにクローズ

## データモデル

### PullRequest テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String | 主キー |
| repositoryId | String | リポジトリ ID |
| number | Int | PR 番号（リポジトリ内で一意） |
| title | String | タイトル |
| description | String? | 説明 |
| sourceBranch | String | ソースブランチ |
| targetBranch | String | ターゲットブランチ |
| status | Enum | Open / Merged / Closed |
| authorId | String | 作成者 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |
| mergedAt | DateTime? | マージ日時 |
| mergedBy | String? | マージした人 |

## URL 設計

| パス | 説明 |
|------|------|
| `/<owner>/<repo>/pulls` | PR 一覧 |
| `/<owner>/<repo>/pulls/new` | PR 作成 |
| `/<owner>/<repo>/pull/<number>` | PR 詳細 |
| `/<owner>/<repo>/pull/<number>/files` | 変更ファイル |
| `/<owner>/<repo>/pull/<number>/commits` | コミット一覧 |

## API 設計

### POST /api/repositories/[id]/pulls

PR を作成。

リクエスト:
```json
{
  "title": "Add new feature",
  "description": "This PR adds...",
  "sourceBranch": "feature/new-feature",
  "targetBranch": "main"
}
```

### GET /api/repositories/[id]/pulls

PR 一覧を取得。

クエリパラメータ:
- `status`: open | closed | merged | all

### GET /api/repositories/[id]/pulls/[number]

PR 詳細を取得。

### POST /api/repositories/[id]/pulls/[number]/merge

PR をマージ。

リクエスト:
```json
{
  "mergeMethod": "merge" | "squash"
}
```

### POST /api/repositories/[id]/pulls/[number]/close

PR をクローズ。

## Git 操作

### 差分取得

```bash
git diff <target>...<source>
```

### マージ可能性チェック

```bash
git merge-base <target> <source>
git merge-tree <base> <target> <source>
```

### マージ実行

```bash
# Merge commit
git checkout <target>
git merge --no-ff <source>

# Squash merge
git checkout <target>
git merge --squash <source>
git commit -m "Merge PR #<number>: <title>"
```

## 実装優先度

1. PR 作成・一覧表示（MVP）
2. 差分表示（MVP）
3. マージ機能（MVP）
4. コンフリクト検出（Phase 2）
5. コードレビューコメント（Phase 3）
