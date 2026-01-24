# コミット履歴仕様

## 目的

- リポジトリのコミット履歴を Web UI から確認できるようにする。

## 機能一覧

### コミット一覧

- 指定ブランチのコミット履歴を表示
- ページネーション対応
- 各コミットの情報:
  - コミットハッシュ（短縮形）
  - コミットメッセージ
  - 作成者
  - 日時

### コミット詳細

- コミットの完全な情報
- 変更ファイル一覧
- 差分表示

### ファイル履歴

- 特定ファイルの変更履歴
- 各コミットでの変更内容

## URL 設計

| パス | 説明 |
|------|------|
| `/<owner>/<repo>/commits` | デフォルトブランチのコミット一覧 |
| `/<owner>/<repo>/commits/<branch>` | 指定ブランチのコミット一覧 |
| `/<owner>/<repo>/commit/<hash>` | コミット詳細 |

## API 設計

### GET /api/repositories/[id]/commits

コミット一覧を取得。

クエリパラメータ:
- `branch`: ブランチ名（デフォルト: HEAD）
- `page`: ページ番号
- `limit`: 取得件数（デフォルト: 30）

レスポンス:
```json
{
  "commits": [
    {
      "hash": "abc123def456...",
      "shortHash": "abc123d",
      "message": "Add new feature",
      "author": {
        "name": "User",
        "email": "user@example.com"
      },
      "date": "2026-01-24T00:00:00Z"
    }
  ],
  "hasMore": true
}
```

### GET /api/repositories/[id]/commits/[hash]

コミット詳細を取得。

レスポンス:
```json
{
  "hash": "abc123def456...",
  "message": "Add new feature\n\nDetailed description...",
  "author": {
    "name": "User",
    "email": "user@example.com"
  },
  "date": "2026-01-24T00:00:00Z",
  "parents": ["parent1hash"],
  "files": [
    {
      "path": "src/index.ts",
      "status": "modified",
      "additions": 10,
      "deletions": 5
    }
  ]
}
```

## Git コマンド

### コミット一覧

```bash
git log --format="%H%n%h%n%s%n%an%n%ae%n%aI" -n <limit> <branch>
```

### コミット詳細

```bash
git show --stat --format="%H%n%B%n%an%n%ae%n%aI%n%P" <hash>
```

### 差分

```bash
git diff <hash>^..<hash>
```

## 実装優先度

1. コミット一覧（MVP）
2. コミット詳細（MVP）
3. ファイル履歴（Phase 2）
