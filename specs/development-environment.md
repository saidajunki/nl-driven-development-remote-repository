# 開発環境仕様

## 目的

- ローカル開発環境を統一し、環境差異によるトラブルを防ぐ。
- 本番環境との差異を最小化する。

## 方針

- **docker-compose を使用**する。
- データベースは**リモートの PostgreSQL**（`.env` に接続情報を記載）を使用し、ローカルにDBコンテナは立てない。

## サービス構成

### ローカル開発環境（docker-compose.yml）

| サービス | 役割 | 備考 |
|---------|------|------|
| `app` | Next.js アプリケーション | ポート 3000 |
| `git` | Git Smart HTTP サーバ | nginx + git-http-backend（オプション） |

### 本番環境（docker-compose.prod.yml）

| サービス | 役割 | 備考 |
|---------|------|------|
| `app` | Next.js アプリケーション | ポート 3000、Git 機能内蔵 |

## Git サーバー構成

### 本番環境

- Next.js アプリ内で直接 `git upload-pack` / `git receive-pack` を実行
- 別の Git サーバーコンテナは不要
- `/api/git/[...path]` エンドポイントで Git Smart HTTP を提供
- Next.js の rewrites で `/<owner>/<repo>.git/*` を `/api/git/*` にリライト

### ローカル開発環境

- 本番と同じ構成（Next.js 内蔵 Git サーバー）を使用可能
- または `git` コンテナを使用した構成も可能（オプション）

## 環境変数

`.env` ファイルに以下を記載（`.env.example` を用意）:

- `DATABASE_URL`: リモート PostgreSQL への接続文字列
- `NEXT_PUBLIC_APP_URL`: アプリケーションの公開 URL（Clone URL に使用）
- `GIT_REPOS_PATH`: Git リポジトリの保存先（デフォルト: `/var/git/repos`）
- `NEXTAUTH_URL`: NextAuth のベース URL
- `NEXTAUTH_SECRET`: NextAuth のシークレットキー
- `GITHUB_CLIENT_ID`: GitHub OAuth クライアント ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth クライアントシークレット

## 注意事項

- リモートDBを使用するため、本番DBと開発DBは分離すること（データ破壊防止）
- `.env` は `.gitignore` に含め、リポジトリにコミットしない
- GitHub OAuth シークレットは絶対に公開しないこと
