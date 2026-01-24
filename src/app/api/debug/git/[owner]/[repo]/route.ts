import { NextRequest, NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/git/git-service';
import { exec } from 'child_process';
import { promisify } from 'util';
import { access } from 'fs/promises';

const execAsync = promisify(exec);

/**
 * デバッグ用: Git リポジトリの状態を確認
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const repoPath = getRepoPath(owner, repo);
  
  const result: Record<string, unknown> = {
    owner,
    repo,
    repoPath,
    GIT_REPOS_PATH: process.env.GIT_REPOS_PATH || '/var/git/repos',
  };

  // パスの存在確認
  try {
    await access(repoPath);
    result.pathExists = true;
  } catch {
    result.pathExists = false;
  }

  // git コマンドの実行
  try {
    const { stdout: branches } = await execAsync(
      `git -C "${repoPath}" branch -a`,
      { encoding: 'utf-8' }
    );
    result.branches = branches.trim().split('\n').filter(Boolean);
  } catch (e) {
    result.branchesError = e instanceof Error ? e.message : String(e);
  }

  try {
    const { stdout: log } = await execAsync(
      `git -C "${repoPath}" log --oneline -5`,
      { encoding: 'utf-8' }
    );
    result.recentCommits = log.trim().split('\n').filter(Boolean);
  } catch (e) {
    result.logError = e instanceof Error ? e.message : String(e);
  }

  try {
    const { stdout: tree } = await execAsync(
      `git -C "${repoPath}" ls-tree HEAD`,
      { encoding: 'utf-8' }
    );
    result.tree = tree.trim().split('\n').filter(Boolean).slice(0, 10);
  } catch (e) {
    result.treeError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(result);
}
