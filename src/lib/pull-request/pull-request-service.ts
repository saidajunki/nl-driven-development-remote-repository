import { prisma } from '@/lib/db/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getRepoPath } from '@/lib/git/git-service';
import { PullRequestStatus } from '@prisma/client';

const execAsync = promisify(exec);

/**
 * Pull Request サービス
 * 仕様: specs/pull-request.md
 */

export interface CreatePullRequestInput {
  repositoryId: string;
  title: string;
  description?: string;
  sourceBranch: string;
  targetBranch: string;
  authorId: string;
}

export interface PullRequestInfo {
  id: string;
  number: number;
  title: string;
  description: string | null;
  sourceBranch: string;
  targetBranch: string;
  status: PullRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  mergedAt: Date | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  mergedBy: {
    id: string;
    name: string | null;
  } | null;
}

/**
 * PR を作成
 */
export async function createPullRequest(
  input: CreatePullRequestInput
): Promise<PullRequestInfo> {
  // 次の PR 番号を取得
  const lastPR = await prisma.pullRequest.findFirst({
    where: { repositoryId: input.repositoryId },
    orderBy: { number: 'desc' },
    select: { number: true },
  });
  const nextNumber = (lastPR?.number || 0) + 1;

  const pr = await prisma.pullRequest.create({
    data: {
      repositoryId: input.repositoryId,
      number: nextNumber,
      title: input.title,
      description: input.description,
      sourceBranch: input.sourceBranch,
      targetBranch: input.targetBranch,
      authorId: input.authorId,
    },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      mergedBy: {
        select: { id: true, name: true },
      },
    },
  });

  return pr;
}

/**
 * PR 一覧を取得
 */
export async function listPullRequests(
  repositoryId: string,
  options?: {
    status?: PullRequestStatus | 'all';
    limit?: number;
    offset?: number;
  }
): Promise<PullRequestInfo[]> {
  const where: { repositoryId: string; status?: PullRequestStatus } = {
    repositoryId,
  };

  if (options?.status && options.status !== 'all') {
    where.status = options.status;
  }

  return prisma.pullRequest.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      mergedBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 20,
    skip: options?.offset ?? 0,
  });
}

/**
 * PR 詳細を取得
 */
export async function getPullRequest(
  repositoryId: string,
  number: number
): Promise<PullRequestInfo | null> {
  return prisma.pullRequest.findUnique({
    where: {
      repositoryId_number: {
        repositoryId,
        number,
      },
    },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      mergedBy: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * PR をマージ
 */
export async function mergePullRequest(
  repositoryId: string,
  number: number,
  userId: string,
  mergeMethod: 'merge' | 'squash' = 'merge'
): Promise<{ success: boolean; error?: string }> {
  const pr = await getPullRequest(repositoryId, number);
  if (!pr) {
    return { success: false, error: 'PR not found' };
  }

  if (pr.status !== 'OPEN') {
    return { success: false, error: 'PR is not open' };
  }

  // リポジトリ情報を取得
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: { owner: { select: { name: true } } },
  });

  if (!repo || !repo.owner.name) {
    return { success: false, error: 'Repository not found' };
  }

  const repoPath = getRepoPath(repo.owner.name, repo.name);

  try {
    // マージを実行
    if (mergeMethod === 'squash') {
      await execAsync(
        `git -C "${repoPath}" checkout ${pr.targetBranch} && ` +
          `git -C "${repoPath}" merge --squash ${pr.sourceBranch} && ` +
          `git -C "${repoPath}" commit -m "Merge PR #${number}: ${pr.title}"`,
        { encoding: 'utf-8' }
      );
    } else {
      await execAsync(
        `git -C "${repoPath}" checkout ${pr.targetBranch} && ` +
          `git -C "${repoPath}" merge --no-ff ${pr.sourceBranch} -m "Merge PR #${number}: ${pr.title}"`,
        { encoding: 'utf-8' }
      );
    }

    // PR ステータスを更新
    await prisma.pullRequest.update({
      where: {
        repositoryId_number: { repositoryId, number },
      },
      data: {
        status: 'MERGED',
        mergedAt: new Date(),
        mergedById: userId,
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Merge failed',
    };
  }
}

/**
 * PR をクローズ
 */
export async function closePullRequest(
  repositoryId: string,
  number: number
): Promise<boolean> {
  const result = await prisma.pullRequest.updateMany({
    where: {
      repositoryId,
      number,
      status: 'OPEN',
    },
    data: {
      status: 'CLOSED',
    },
  });

  return result.count > 0;
}

/**
 * マージ可能かチェック
 */
export async function canMerge(
  ownerName: string,
  repoName: string,
  sourceBranch: string,
  targetBranch: string
): Promise<{ canMerge: boolean; conflicts?: string[] }> {
  const repoPath = getRepoPath(ownerName, repoName);

  try {
    // マージベースを取得
    const { stdout: mergeBase } = await execAsync(
      `git -C "${repoPath}" merge-base ${targetBranch} ${sourceBranch}`,
      { encoding: 'utf-8' }
    );

    // マージツリーでコンフリクトをチェック
    const { stdout: mergeTree } = await execAsync(
      `git -C "${repoPath}" merge-tree ${mergeBase.trim()} ${targetBranch} ${sourceBranch}`,
      { encoding: 'utf-8' }
    );

    // コンフリクトがあるかチェック
    const hasConflicts = mergeTree.includes('<<<<<<<') || mergeTree.includes('>>>>>>>');

    if (hasConflicts) {
      // コンフリクトファイルを抽出
      const conflictFiles = mergeTree
        .split('\n')
        .filter((line) => line.includes('changed in both'))
        .map((line) => line.split(' ').pop() || '');

      return { canMerge: false, conflicts: conflictFiles };
    }

    return { canMerge: true };
  } catch {
    return { canMerge: false };
  }
}
