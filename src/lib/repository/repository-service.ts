import { prisma } from '@/lib/db/prisma';
import { initBareRepository, deleteRepositoryFiles } from '@/lib/git/git-service';

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
 * DB にレコードを作成し、bare リポジトリを初期化する
 */
export async function createRepository(
  input: CreateRepositoryInput
): Promise<RepositoryInfo> {
  if (!isValidRepositoryName(input.name)) {
    throw new Error('リポジトリ名が不正です');
  }

  // まずオーナー情報を取得
  const owner = await prisma.user.findUnique({
    where: { id: input.ownerId },
    select: { id: true, name: true },
  });

  if (!owner || !owner.name) {
    throw new Error('オーナーが見つかりません');
  }

  // DB にレコード作成
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

  // bare リポジトリを初期化
  try {
    await initBareRepository(owner.name, input.name);
  } catch (error) {
    // 失敗した場合は DB レコードも削除
    await prisma.repository.delete({ where: { id: repository.id } });
    throw error;
  }

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
 * DB レコードと bare リポジトリの両方を削除
 */
export async function deleteRepository(
  repoId: string,
  userId: string
): Promise<boolean> {
  // まずリポジトリ情報を取得
  const repo = await prisma.repository.findFirst({
    where: {
      id: repoId,
      ownerId: userId,
    },
    include: {
      owner: {
        select: { name: true },
      },
    },
  });

  if (!repo || !repo.owner.name) {
    return false;
  }

  // DB レコード削除
  const result = await prisma.repository.deleteMany({
    where: {
      id: repoId,
      ownerId: userId,
    },
  });

  if (result.count > 0) {
    // bare リポジトリも削除（エラーは無視）
    try {
      await deleteRepositoryFiles(repo.owner.name, repo.name);
    } catch {
      // ファイル削除失敗は無視
    }
  }

  return result.count > 0;
}
