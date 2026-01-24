# ブランチ管理仕様

## 目的

- リポジトリ内のブランチを Web UI から確認・管理できるようにする。

## 機能一覧

### ブランチ一覧表示

- リポジトリ内の全ブランチを一覧表示
- デフォルトブランチを明示
- 各ブランチの最新コミット情報を表示
  - コミットメッセージ
  - 作成者
  - 日時

### ブランチ切り替え

- ファイルツリー表示時にブランチを選択可能
- URL 形式: `/<owner>/<repo>/tree/<branch>`

### ブランチ作成（将来実装）

- Web UI からブランチを作成
- 既存ブランチまたはコミットから分岐

### ブランチ削除（将来実装）

- Web UI からブランチを削除
- デフォルトブランチは削除不可
- 保護ブランチの設定

## URL 設計

| パス | 説明 |
|------|------|
| `/<owner>/<repo>/branches` | ブランチ一覧 |
| `/<owner>/<repo>/tree/<branch>` | 指定ブランチのルート |
| `/<owner>/<repo>/tree/<branch>/<path>` | 指定ブランチの指定パス |

## API 設計

### GET /api/repositories/[id]/branches

ブランチ一覧を取得。

レスポンス:
```json
{
  "branches": [
    {
      "name": "main",
      "isDefault": true,
      "lastCommit": {
        "hash": "abc123",
        "message": "Initial commit",
        "author": "user",
        "date": "2026-01-24T00:00:00Z"
      }
    }
  ]
}
```

## 実装優先度

1. ブランチ一覧表示（MVP）
2. ブランチ切り替え（MVP）
3. ブランチ作成（Phase 2）
4. ブランチ削除（Phase 2）
