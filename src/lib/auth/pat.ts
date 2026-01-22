import { randomBytes, createHash } from 'crypto';

/**
 * PAT（Personal Access Token）関連のユーティリティ
 * 仕様: specs/auth-pat.md
 */

/** PAT のプレフィックス（識別用） */
const PAT_PREFIX = 'nldr_';

/** PAT の長さ（プレフィックス除く） */
const PAT_LENGTH = 32;

/**
 * 新しい PAT を生成する
 * @returns 平文の PAT（プレフィックス付き）
 */
export function generatePat(): string {
  const token = randomBytes(PAT_LENGTH).toString('hex');
  return `${PAT_PREFIX}${token}`;
}

/**
 * PAT をハッシュ化する（DB 保存用）
 * @param plainPat 平文の PAT
 * @returns SHA-256 ハッシュ
 */
export function hashPat(plainPat: string): string {
  return createHash('sha256').update(plainPat).digest('hex');
}

/**
 * PAT の形式が正しいか検証する
 * @param pat 検証対象の文字列
 * @returns 形式が正しければ true
 */
export function isValidPatFormat(pat: string): boolean {
  // プレフィックス + 64文字の16進数（32バイト）
  const expectedLength = PAT_PREFIX.length + PAT_LENGTH * 2;
  if (pat.length !== expectedLength) {
    return false;
  }
  if (!pat.startsWith(PAT_PREFIX)) {
    return false;
  }
  const tokenPart = pat.slice(PAT_PREFIX.length);
  return /^[0-9a-f]+$/.test(tokenPart);
}
