# Git リモートサービス仕様（HTTPS）

## 目的

- 自前のリモートリポジトリをホストし、通常の Git クライアントから `clone/fetch/push` できるようにする。

## 通信方式

- Git の通信は **HTTPS (Git Smart HTTP)** を採用する。
  - 読み取り: `git-upload-pack`（clone/fetch）
  - 書き込み: `git-receive-pack`（push）

## 公開範囲（認可）

- `clone/fetch` は誰でも可能（public）。
- `push` は認証済みユーザーのみ可能（詳細は `auth-pat.md`）。

## リポジトリの実体

- サーバ上に **bare repository** を保存する（例: `repos/<owner>/<repo>.git`）。
- Git 受け口は `git-http-backend` を利用して smart HTTP を提供する想定。

## Hooks（必須）

### pre-receive（push 前）

- リポジトリ構造の必須要件を検証し、違反があれば push を拒否する（詳細は `repository-conventions.md`）。

### post-receive（push 後）

- 解析（`specs/`/`rules/` のインデックス、ルール割合、coverage 取り込み等）を実行/キュー投入する（詳細は `analytics.md`）。

## 決定事項

### リポジトリ作成フロー

- **Web UI で事前作成が必須**
- 初回 push での自動作成は行わない
- 存在しないリポジトリへの push は拒否する

### URL 形式

- Git 操作: `https://<host>/<owner>/<repo>.git`
- Web UI: `https://<host>/<owner>/<repo>`（リポジトリトップページ）

