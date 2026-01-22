import { verifyPat } from '@/lib/auth/pat-service';

/**
 * Git 認証
 * 仕様: specs/auth-pat.md - Git push の認証方式
 */

/**
 * Basic 認証ヘッダーをパースする
 * @param authHeader Authorization ヘッダーの値
 * @returns ユーザー名とパスワード（PAT）
 */
export function parseBasicAuth(
  authHeader: string | null
): { username: string; password: string } | null {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

/**
 * Git 操作の認証を行う
 * @param authHeader Authorization ヘッダー
 * @returns 認証成功時はユーザー情報、失敗時は null
 */
export async function authenticateGitRequest(
  authHeader: string | null
): Promise<{ userId: string; userName: string | null } | null> {
  const credentials = parseBasicAuth(authHeader);
  if (!credentials) {
    return null;
  }

  // パスワードとして PAT を検証
  return verifyPat(credentials.password);
}
