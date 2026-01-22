import { prisma } from '@/lib/db/prisma';
import { generatePat, hashPat, isValidPatFormat } from './pat';

/**
 * PAT サービス
 * 仕様: specs/auth-pat.md
 */

export interface CreatePatInput {
  name: string;
  userId: string;
  expiresAt?: Date;
}

export interface PatInfo {
  id: string;
  name: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
}

/**
 * 新しい PAT を作成する
 * @returns 平文の PAT（この時点でのみ取得可能）と PAT 情報
 */
export async function createPat(input: CreatePatInput): Promise<{
  plainToken: string;
  pat: PatInfo;
}> {
  const plainToken = generatePat();
  const tokenHash = hashPat(plainToken);

  const pat = await prisma.personalAccessToken.create({
    data: {
      name: input.name,
      tokenHash,
      userId: input.userId,
      expiresAt: input.expiresAt,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
    },
  });

  return { plainToken, pat };
}

/**
 * ユーザーの PAT 一覧を取得する
 */
export async function listPats(userId: string): Promise<PatInfo[]> {
  return prisma.personalAccessToken.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * PAT を失効させる（削除）
 */
export async function revokePat(patId: string, userId: string): Promise<boolean> {
  const result = await prisma.personalAccessToken.deleteMany({
    where: {
      id: patId,
      userId, // 所有者のみ削除可能
    },
  });
  return result.count > 0;
}

/**
 * PAT を検証し、有効であればユーザー情報を返す
 * Git push 認証時に使用
 */
export async function verifyPat(plainToken: string): Promise<{
  userId: string;
  userName: string | null;
} | null> {
  // 形式チェック
  if (!isValidPatFormat(plainToken)) {
    return null;
  }

  const tokenHash = hashPat(plainToken);

  const pat = await prisma.personalAccessToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!pat) {
    return null;
  }

  // 有効期限チェック
  if (pat.expiresAt && pat.expiresAt < new Date()) {
    return null;
  }

  // lastUsedAt を更新（非同期で実行、エラーは無視）
  prisma.personalAccessToken
    .update({
      where: { id: pat.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      // 更新失敗は無視（認証自体は成功させる）
    });

  return {
    userId: pat.user.id,
    userName: pat.user.name,
  };
}
