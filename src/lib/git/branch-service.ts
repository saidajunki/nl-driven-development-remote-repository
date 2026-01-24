import { exec } from 'child_process';
import { promisify } from 'util';
import { getRepoPath } from './git-service';

const execAsync = promisify(exec);

/**
 * ブランチ管理サービス
 * 仕様: specs/branch-management.md
 */

export interface BranchInfo {
  name: string;
  isDefault: boolean;
  lastCommit: {
    hash: string;
    shortHash: string;
    message: string;
    author: string;
    date: Date;
  } | null;
}

/**
 * ブランチ一覧を取得
 */
export async function listBranches(
  ownerName: string,
  repoName: string
): Promise<BranchInfo[]> {
  const repoPath = getRepoPath(ownerName, repoName);

  try {
    // デフォルトブランチを取得
    let defaultBranch = 'main';
    try {
      const { stdout: headRef } = await execAsync(
        `git -C "${repoPath}" symbolic-ref --short HEAD`,
        { encoding: 'utf-8' }
      );
      defaultBranch = headRef.trim();
    } catch {
      // HEAD が設定されていない場合
    }

    // ブランチ一覧を取得
    const { stdout } = await execAsync(
      `git -C "${repoPath}" for-each-ref --format="%(refname:short)|%(objectname)|%(objectname:short)|%(subject)|%(authorname)|%(authordate:iso8601)" refs/heads/`,
      { encoding: 'utf-8' }
    );

    if (!stdout.trim()) {
      return [];
    }

    return stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [name, hash, shortHash, message, author, dateStr] = line.split('|');
        return {
          name: name!,
          isDefault: name === defaultBranch,
          lastCommit: hash
            ? {
                hash: hash!,
                shortHash: shortHash!,
                message: message || '',
                author: author || '',
                date: new Date(dateStr || ''),
              }
            : null,
        };
      })
      .sort((a, b) => {
        // デフォルトブランチを先頭に
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return a.name.localeCompare(b.name);
      });
  } catch {
    return [];
  }
}

/**
 * ブランチが存在するか確認
 */
export async function branchExists(
  ownerName: string,
  repoName: string,
  branchName: string
): Promise<boolean> {
  const repoPath = getRepoPath(ownerName, repoName);

  try {
    await execAsync(
      `git -C "${repoPath}" rev-parse --verify "refs/heads/${branchName}"`,
      { encoding: 'utf-8' }
    );
    return true;
  } catch {
    return false;
  }
}
