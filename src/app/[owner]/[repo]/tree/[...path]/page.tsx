import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { listTree, getLatestCommit } from '@/lib/git/git-tree';
import { Header } from '@/components/ui/Header';

/**
 * ディレクトリ表示ページ
 * 仕様: specs/file-viewer.md
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ owner: string; repo: string; path: string[] }>;
}

export default async function TreePage({ params }: Props) {
  const { owner, repo, path: pathSegments } = await params;
  const branch = pathSegments[0] || 'main';
  const dirPath = pathSegments.slice(1).join('/');

  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository) {
    notFound();
  }

  const [tree, latestCommit] = await Promise.all([
    listTree(owner, repo, branch, dirPath).catch(() => []),
    getLatestCommit(owner, repo, branch).catch(() => null),
  ]);

  // パンくずリスト用
  const pathParts = dirPath ? dirPath.split('/') : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session?.user?.name} userImage={session?.user?.image} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* パンくずリスト */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link href={`/${owner}/${repo}`} className="text-blue-600 hover:underline">
            {repo}
          </Link>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              <Link
                href={`/${owner}/${repo}/tree/${branch}/${pathParts.slice(0, i + 1).join('/')}`}
                className="text-blue-600 hover:underline"
              >
                {part}
              </Link>
            </span>
          ))}
        </div>

        {/* ブランチ選択 */}
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={`/${owner}/${repo}/branches`}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
          >
            🌿 {branch}
          </Link>
        </div>

        {/* ファイル一覧 */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          {/* 最新コミット */}
          {latestCommit && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200/60 flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full shrink-0" />
              <span className="text-sm font-medium text-gray-900">
                {latestCommit.author}
              </span>
              <span className="text-sm text-gray-600 flex-1 truncate">
                {latestCommit.message}
              </span>
              <span className="text-xs text-gray-500">
                {latestCommit.date.toLocaleDateString('ja-JP')}
              </span>
              <code className="text-xs bg-gray-200 px-2 py-1 rounded-lg font-mono">
                {latestCommit.hash.slice(0, 7)}
              </code>
            </div>
          )}

          {/* ディレクトリ一覧 */}
          {tree.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              ファイルがありません
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* 親ディレクトリへのリンク */}
              {dirPath && (
                <Link
                  href={
                    pathParts.length > 1
                      ? `/${owner}/${repo}/tree/${branch}/${pathParts.slice(0, -1).join('/')}`
                      : `/${owner}/${repo}/tree/${branch}`
                  }
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-sm text-gray-600">..</span>
                </Link>
              )}
              {tree.map((entry) => (
                <Link
                  key={entry.hash}
                  href={
                    entry.type === 'tree'
                      ? `/${owner}/${repo}/tree/${branch}/${dirPath ? `${dirPath}/` : ''}${entry.name}`
                      : `/${owner}/${repo}/blob/${branch}/${dirPath ? `${dirPath}/` : ''}${entry.name}`
                  }
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {entry.type === 'tree' ? (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="text-sm text-gray-900 hover:text-blue-600 hover:underline">
                    {entry.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
