import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, access, rm } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

/**
 * Git サービス
 * 仕様: specs/git-service.md
 */

/** Git リポジトリの保存先ディレクトリ */
const GIT_REPOS_PATH = process.env.GIT_REPOS_PATH || '/var/git/repos';

/**
 * リポジトリのファイルシステムパスを取得
 */
export function getRepoPath(ownerName: string, repoName: string): string {
  return join(GIT_REPOS_PATH, ownerName, `${repoName}.git`);
}

/**
 * bare リポジトリを初期化する
 * 仕様: specs/git-service.md - リポジトリの実体
 */
export async function initBareRepository(
  ownerName: string,
  repoName: string
): Promise<void> {
  const repoPath = getRepoPath(ownerName, repoName);

  // ディレクトリ作成
  await mkdir(repoPath, { recursive: true });

  // git init --bare
  await execAsync(`git init --bare "${repoPath}"`);

  // git-http-backend 用の設定
  await execAsync(`git -C "${repoPath}" config http.receivepack true`);
  await execAsync(`git -C "${repoPath}" config http.uploadpack true`);
}

/**
 * リポジトリが存在するか確認
 */
export async function repositoryExists(
  ownerName: string,
  repoName: string
): Promise<boolean> {
  const repoPath = getRepoPath(ownerName, repoName);
  try {
    await access(repoPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * リポジトリを削除する
 */
export async function deleteRepositoryFiles(
  ownerName: string,
  repoName: string
): Promise<void> {
  const repoPath = getRepoPath(ownerName, repoName);
  await rm(repoPath, { recursive: true, force: true });
}

/**
 * リポジトリの Git URL を生成
 * 仕様: specs/git-service.md - URL 形式
 */
export function getGitUrl(
  host: string,
  ownerName: string,
  repoName: string
): string {
  return `https://${host}/${ownerName}/${repoName}.git`;
}
