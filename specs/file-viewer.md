# ファイル表示仕様

## 目的

- リポジトリ内のファイル内容を Web UI から閲覧できるようにする。

## 機能一覧

### ファイル内容表示

- テキストファイルの内容を表示
- シンタックスハイライト対応
- 行番号表示
- Raw 表示（生データ）

### ディレクトリ表示

- ファイル・ディレクトリ一覧
- 各エントリの最終コミット情報
- パンくずナビゲーション

### バイナリファイル

- 画像ファイルのプレビュー
- その他のバイナリはダウンロードリンク

## URL 設計

| パス | 説明 |
|------|------|
| `/<owner>/<repo>/tree/<branch>/<path>` | ディレクトリ表示 |
| `/<owner>/<repo>/blob/<branch>/<path>` | ファイル表示 |
| `/<owner>/<repo>/raw/<branch>/<path>` | Raw ファイル |

## API 設計

### GET /api/repositories/[id]/tree

ディレクトリ内容を取得。

クエリパラメータ:
- `ref`: ブランチ名またはコミットハッシュ
- `path`: ディレクトリパス

レスポンス:
```json
{
  "entries": [
    {
      "name": "src",
      "type": "tree",
      "mode": "040000",
      "hash": "abc123"
    },
    {
      "name": "README.md",
      "type": "blob",
      "mode": "100644",
      "hash": "def456",
      "size": 1234
    }
  ]
}
```

### GET /api/repositories/[id]/blob

ファイル内容を取得。

クエリパラメータ:
- `ref`: ブランチ名またはコミットハッシュ
- `path`: ファイルパス

レスポンス:
```json
{
  "content": "file content...",
  "encoding": "utf-8",
  "size": 1234,
  "isBinary": false
}
```

## シンタックスハイライト

対応言語（Prism.js または highlight.js を使用）:
- JavaScript / TypeScript
- Python
- Go
- Rust
- Java
- C / C++
- HTML / CSS
- JSON / YAML
- Markdown
- Shell

## 実装優先度

1. ファイル内容表示（MVP）
2. ディレクトリナビゲーション（MVP）
3. シンタックスハイライト（MVP）
4. 画像プレビュー（Phase 2）
5. Raw ダウンロード（Phase 2）
