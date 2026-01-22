import 'next-auth';

/**
 * NextAuth の型拡張
 * セッションにユーザー ID を含める
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
