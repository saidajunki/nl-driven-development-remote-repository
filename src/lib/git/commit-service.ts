import { exec } from 'child_process';
import { promisify } from 'util';
import { getRepoPath } from './git-service';

const execAsync = promisify(exec);

/**
 * コミット履歴サービス
 * 仕様: specs/commit-history.md
 */

export interface CommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  date: Date;
}

export interface CommitDetail extends CommitInfo {
  fullMessage: string;
  parents: string[];
  files: {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    additions?: number;
    deletions?: number;
  }[];
}

/**
 * コミット一覧を取得
 */
export async function listCommits(
  ownerName: string,
  repoName: string,
  options?: {
    branch?: string;
    limit?: number;
    skip?: number;
  }
): Promise<{ commits: CommitInfo[]; hasMore: boolean }> {
  const repoPath = getRepoPath(ownerName, repoName);
  const branch = options?.branch || 'HEAD';
  const limit = options?.limit || 30;
  const skip = options?.skip || 0;

  try {
    const { stdout } = await execAsync(
      `git -C "${repoPath}" log --format="%H|%h|%s|%an|%ae|%aI" -n ${limit + 1} --skip=${skip} ${branch}`,
      { encoding: 'utf-8' }
    );

    if (!stdout.trim()) {
      return { commits: [], hasMore: false };
    }

    const lines = stdout.trim().split('\n');
    const hasMore = lines.length > limit;
    const commits = lines.slice(0, limit).map((line) => {
      const [hash, shortHash, message, authorName, authorEmail, dateStr] = line.split('|');
      return {
        hash: hash!,
        shortHash: shortHash!,
        message: message || '',
        author: {
          name: authorName || '',
          email: authorEmail || '',
        },
        date: new Date(dateStr || ''),
      };
    });

    return { commits, hasMore };
  } catch {
    return { commits: [], hasMore: false };
  }
}

/**
 * コミット詳細を取得
 */
export async function getCommitDetail(
  ownerName: string,
  repoName: string,
  hash: string
): Promise<CommitDetail | null> {
  const repoPath = getRepoPath(ownerName, repoName);

  try {
    // コミット情報を取得
    const { stdout: commitInfo } = await execAsync(
      `git -C "${repoPath}" log -1 --format="%H|%h|%s|%B|%an|%ae|%aI|%P" ${hash}`,
      { encoding: 'utf-8' }
    );

    const [hashFull, shortHash, subject, ...rest] = commitInfo.trim().split('|');
    const lastParts = rest.join('|').split('|');
    const parents = lastParts.pop()?.trim().split(' ').filter(Boolean) || [];
    const dateStr = lastParts.pop() || '';
    const authorEmail = lastParts.pop() || '';
    const authorName = lastParts.pop() || '';
    const fullMessage = lastParts.join('|');

    // 変更ファイル一覧を取得
    const { stdout: diffStat } = await execAsync(
      `git -C "${repoPath}" diff-tree --no-commit-id --name-status -r ${hash}`,
      { encoding: 'utf-8' }
    );

    const files = diffStat
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [status, path] = line.split('\t');
        const statusMap: Record<string, 'added' | 'modified' | 'deleted' | 'renamed'> = {
          A: 'added',
          M: 'modified',
          D: 'deleted',
          R: 'renamed',
        };
        return {
          path: path || '',
          status: statusMap[status?.[0] || 'M'] || 'modified',
        };
      });

    return {
      hash: hashFull!,
      shortHash: shortHash!,
      message: subject || '',
      fullMessage,
      author: {
        name: authorName,
        email: authorEmail,
      },
      date: new Date(dateStr),
      parents,
      files,
    };
  } catch {
    return null;
  }
}

/**
 * 2つのコミット間の差分を取得
 */
export async function getDiff(
  ownerName: string,
  repoName: string,
  base: string,
  head: string
): Promise<string> {
  const repoPath = getRepoPath(ownerName, repoName);

  try {
    const { stdout } = await execAsync(
      `git -C "${repoPath}" diff ${base}...${head}`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    return stdout;
  } catch {
    return '';
  }
}
