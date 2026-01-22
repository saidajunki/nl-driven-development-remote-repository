# 解析・集計仕様（ルール割合 / カバレッジ）

## 目的

- `specs/` と `rules/` を Web で高速に表示できるようにインデックス化する。
- ルール割合、カバレッジ等を集計して UI に表示する。

## トリガ

- `post-receive`（push 完了後）に、対象 commit/branch を解析する。

## 集計（MVP）

### ルール割合

- 対象: `rules/` 配下の Markdown
- 分類: `repository-conventions.md` のカテゴリ規約に従う
- 指標: まずはカテゴリ別ファイル件数（拡張で行数/文字数）

### specs インデックス

- 対象: `specs/` 配下の Markdown
- 目的: 目次生成・全文検索（将来）

### カバレッジ

- 対象: `reports/coverage/coverage.yml`
- 形式: YAML
- 指標: lines/branches/functions の全体値

