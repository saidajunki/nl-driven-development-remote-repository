import { prisma } from '@/lib/db/prisma';

/**
 * リポジトリサービス
 * 仕様: specs/git-service.md, specs/web-ui.md
 */

export interface CreateRepositoryInput {
  name: string;
  description?: string;
  ownerId: string;
  isPublic?: boolean;
}

export interface RepositoryInfo {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string | null;
  };
}

/**
 * リポジトリ名のバリデーション
 * - 英数字、ハイフン、アンダースコアのみ
 * - 1〜100文字
 */
export function isValidRepositoryName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,100}$/.test(name);
}

/**
 * リポジトリを作成する
 */
export async function createRepository(
  input: CreateRepositoryInput
): Promise<RepositoryInfo> {
  if (!isValidRepositoryName(input.name)) {
    throw new Error('リポジトリ名が不正です');
  }

  const repository = await prisma.repository.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      isPublic: input.isPublic ?? true,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return repository;
}

/**
 * リポジトリ一覧を取得する
 */
export async function listRepositories(options?: {
  ownerId?: string;
  limit?: number;
  offset?: number;
}): Promise<RepositoryInfo[]> {
  return prisma.repository.findMany({
    where: options?.ownerId ? { ownerId: options.ownerId } : undefined,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: options?.limit ?? 20,
    skip: options?.offset ?? 0,
  });
}

/**
 * リポジトリを取得する（オーナー名とリポジトリ名で）
 */
export async function getRepositoryByOwnerAndName(
  ownerName: string,
  repoName: string
): Promise<RepositoryInfo | null> {
  // まずオーナーを検索
  const owner = await prisma.user.findFirst({
    where: { name: ownerName },
  });

  if (!owner) {
    return null;
  }

  return prisma.repository.findUnique({
    where: {
      ownerId_name: {
        ownerId: owner.id,
        name: repoName,
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * リポジトリを削除する
 */
export async function deleteRepository(
  repoId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.repository.deleteMany({
    where: {
      id: repoId,
      ownerId: userId, // 所有者のみ削除可能
    },
  });
  return result.count > 0;
}
