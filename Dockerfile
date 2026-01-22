FROM node:22-alpine

WORKDIR /app

# 依存関係のインストール
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

# ソースコードのコピー
COPY . .

# Prisma クライアント生成
RUN pnpm db:generate

# ビルド
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
