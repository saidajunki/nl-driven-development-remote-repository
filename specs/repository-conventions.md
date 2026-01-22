# リポジトリ規約（必須構造）

## 目的

- 仕様書・ルールが「見つかる/読める/可視化できる」状態を、Git レベル（push 時）で担保する。

## 必須ディレクトリ（リポジトリ直下）

- `specs/`: 要件定義書・仕様書を格納する
- `rules/`: ルール（セキュリティ、コーディング規約等）を格納する

## 推奨ファイル（MVP）

- `specs/README.md`: 仕様書の目次/読み方
- `rules/README.md`: ルールの目次/読み方

## ルール種類の可視化（分類ルール）

MVP では「ファイル名（またはサブディレクトリ）」で分類できる形を推奨する。

### 例（このリポジトリのスタイル）

- `rules/security.md`（security）
- `rules/coding.md`（coding）
- `rules/testing.md`（testing）
- `rules/performance.md`（performance）
- `rules/accessibility.md`（accessibility）
- `rules/architecture.md`（architecture）
- `rules/git.md`（git）
- `rules/always.md`（always）

可視化（割合）は、最低限「カテゴリ別のファイル件数」から始め、必要に応じて「カテゴリ別の行数/文字数」に拡張する。

## テストカバレッジの取り込み（配置）

MVP は「サーバでテスト実行」ではなく、リポジトリ内に置かれたレポートを取り込む方式とする。

### 決定事項

- **レポート形式**: YAML（`.yml`）
- **配置パス**: `reports/coverage/coverage.yml`

### レポート形式（案）

```yaml
# reports/coverage/coverage.yml
summary:
  lines: 85.5      # 行カバレッジ（%）
  branches: 72.3   # 分岐カバレッジ（%）
  functions: 90.1  # 関数カバレッジ（%）
generatedAt: "2025-01-22T10:00:00Z"
```

