# アーキテクチャ

## ディレクトリ構成

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 認証関連ページ
│   │   ├── [owner]/            # オーナー/リポジトリページ
│   │   │   └── [repo]/
│   │   ├── api/                # API Routes
│   │   └── layout.tsx
│   ├── components/             # UIコンポーネント
│   │   ├── ui/                 # 汎用UIコンポーネント
│   │   └── features/           # 機能別コンポーネント
│   ├── lib/                    # ユーティリティ・ライブラリ
│   │   ├── git/                # Git操作関連
│   │   ├── auth/               # 認証関連
│   │   └── db/                 # データベース関連
│   └── types/                  # 型定義
├── e2e/                        # E2Eテスト（Playwright）
├── docker/                     # Docker関連ファイル
│   └── git/                    # Git Smart HTTPサーバ設定
├── specs/                      # 仕様書
├── rules/                      # 開発ルール
├── reports/                    # レポート（カバレッジ等）
│   └── coverage/
├── docker-compose.yml
├── .env.example
└── package.json
```

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 (App Router), React 19, TypeScript |
| スタイリング | Tailwind CSS |
| 認証 | NextAuth.js v5 |
| ORM | Prisma |
| データベース | PostgreSQL（リモート） |
| Git サーバ | nginx + git-http-backend |
| テスト | Vitest, React Testing Library, Playwright |
| コンテナ | Docker, docker-compose |

## 依存関係

```
[ブラウザ]
    ↓ HTTPS
[Next.js App] ←→ [PostgreSQL（リモート）]
    ↓
[Git Smart HTTP Server (nginx + git-http-backend)]
    ↓
[Bare Repositories (ファイルシステム)]
```

## サービス間通信

- Next.js → PostgreSQL: Prisma経由（DATABASE_URL）
- Next.js → Git Server: 内部HTTP（docker network）
- クライアント → Git Server: HTTPS（git clone/push/fetch）
