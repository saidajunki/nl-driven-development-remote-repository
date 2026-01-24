import { exec } from 'child_process';
import { promisify } from 'util';
import { getRepoPath } from './git-service';

const execAsync = promisify(exec);

/**
 * Git ツリー操作
 * 仕様: specs/web-ui.md - リポジトリ詳細
 */

export interface TreeEntry {
  mode: string;
  type: 'blob' | 'tree';
  hash: string;
  name: string;
}

/**
 * リポジトリのファイル・ディレクトリ一覧を取得
 * @param ownerName オーナー名
 * @param repoName リポジトリ名
 * @param ref ブランチ名またはコミットハッシュ（デフォルト: HEAD）
 * @param path サブディレクトリパス（デフォルト: ルート）
 */
export async function listTree(
  ownerName: string,
  repoName: string,
  ref = 'HEAD',
  path = ''
): Promise<TreeEntry[]> {
  const repoPath = getRepoPath(ownerName, repoName);
  
  // HEADが無効な場合、デフォルトブランチを使用
  let actualRef = ref;
  if (ref === 'HEAD') {
    const defaultBranch = await getDefaultBranch(ownerName, repoName);
    if (defaultBranch) {
      actualRef = defaultBranch;
    }
  }
  
  const targetPath = path ? `${actualRef}:${path}` : actualRef;

  try {
    const { stdout } = await execAsync(
      `git -C "${repoPath}" ls-tree ${targetPath}`,
      { encoding: 'utf-8' }
    );

    if (!stdout.trim()) {
      return [];
    }

    return stdout
      .trim()
      .split('\n')
      .map((line) => {
        // 形式: <mode> <type> <hash>\t<name>
        const match = line.match(/^(\d+)\s+(blob|tree)\s+([a-f0-9]+)\t(.+)$/);
        if (!match) {
          throw new Error(`不正な ls-tree 出力: ${line}`);
        }
        return {
          mode: match[1]!,
          type: match[2] as 'blob' | 'tree',
          hash: match[3]!,
          name: match[4]!,
        };
      })
      // ディレクトリを先に、その後ファイルをアルファベット順
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'tree' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  } catch (error) {
    // リポジトリが空の場合など
    if (error instanceof Error && error.message.includes('fatal:')) {
      return [];
    }
    throw error;
  }
}

/**
 * ファイルの内容を取得
 */
export async function getFileContent(
  ownerName: string,
  repoName: string,
  filePath: string,
  ref = 'HEAD'
): Promise<string | null> {
  const repoPath = getRepoPath(ownerName, repoName);

  try {
    const { stdout } = await execAsync(
      `git -C "${repoPath}" show ${ref}:${filePath}`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 } // 10MB まで
    );
    return stdout;
  } catch {
    return null;
  }
}

/**
 * デフォルトブランチを取得
 * HEADが無効な場合は、最初に見つかったブランチを返す
 */
export async function getDefaultBranch(
  ownerName: string,
  repoName: string
): Promise<string | null> {
  const repoPath = getRepoPath(ownerName, repoName);

  try {
    // まずHEADが指すブランチを取得
    const { stdout } = await execAsync(
      `git -C "${repoPath}" symbolic-ref --short HEAD`,
      { encoding: 'utf-8' }
    );
    const headBranch = stdout.trim();
    
    // HEADが指すブランチが実際に存在するか確認
    try {
      await execAsync(
        `git -C "${repoPath}" rev-parse --verify ${headBranch}`,
        { encoding: 'utf-8' }
      );
      return headBranch;
    } catch {
      // HEADが指すブランチが存在しない場合、最初のブランチを探す
    }
  } catch {
    // symbolic-refが失敗した場合
  }

  // フォールバック: 最初に見つかったブランチを返す
  try {
    const { stdout: branches } = await execAsync(
      `git -C "${repoPath}" branch --list`,
      { encoding: 'utf-8' }
    );
    const branchList = branches.trim().split('\n').map(b => b.replace(/^\*?\s*/, '').trim()).filter(Boolean);
    // main, master を優先
    if (branchList.includes('main')) return 'main';
    if (branchList.includes('master')) return 'master';
    return branchList[0] || null;
  } catch {
    return null;
  }
}

/**
 * 最新コミット情報を取得
 */
export async function getLatestCommit(
  ownerName: string,
  repoName: string,
  ref = 'HEAD'
): Promise<{
  hash: string;
  message: string;
  author: string;
  date: Date;
} | null> {
  const repoPath = getRepoPath(ownerName, repoName);

  // HEADが無効な場合、デフォルトブランチを使用
  let actualRef = ref;
  if (ref === 'HEAD') {
    const defaultBranch = await getDefaultBranch(ownerName, repoName);
    if (defaultBranch) {
      actualRef = defaultBranch;
    }
  }

  try {
    const { stdout } = await execAsync(
      `git -C "${repoPath}" log -1 --format="%H%n%s%n%an%n%aI" ${actualRef}`,
      { encoding: 'utf-8' }
    );
    const [hash, message, author, dateStr] = stdout.trim().split('\n');
    if (!hash || !message || !author || !dateStr) {
      return null;
    }
    return {
      hash,
      message,
      author,
      date: new Date(dateStr),
    };
  } catch {
    return null;
  }
}
