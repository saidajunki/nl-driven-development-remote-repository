import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHub from 'next-auth/providers/github';
import { prisma } from '@/lib/db/prisma';

/**
 * NextAuth 設定
 * 仕様: specs/auth-pat.md - Web UI 認証
 *
 * GitHub OAuth は認証のみに使用。
 * - リフレッシュトークンは取得しない（スコープ制限）
 * - GitHub API へのアクセスは一切行わない
 * - 認可はすべて git-nl 側で管理
 *
 * 注意: NextAuth は内部的にトークンを一時的に使用するが、
 * セッションには含めず、API アクセスには使用しない。
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // 最小限のスコープのみ（認証に必要な情報のみ）
      // リフレッシュトークンは要求しない
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  callbacks: {
    // セッションにユーザー ID を含める（トークンは含めない）
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      // アクセストークンはセッションに含めない
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  // セッション戦略: データベースセッション（JWT ではなく）
  session: {
    strategy: 'database',
  },
});
