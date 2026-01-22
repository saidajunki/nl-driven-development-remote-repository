import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { listTree, getLatestCommit, getDefaultBranch } from '@/lib/git/git-tree';

/**
 * リポジトリ詳細ページ
 * 仕様: specs/web-ui.md - リポジトリ詳細
 * URL: https://<host>/<owner>/<repo>
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export default async function RepositoryPage({ params }: Props) {
  const { owner, repo } = await params;
  const repository = await getRepositoryByOwnerAndName(owner, repo);

  if (!repository) {
    notFound();
  }

  // Git 情報を取得
  const [tree, latestCommit, defaultBranch] = await Promise.all([
    listTree(owner, repo).catch(() => []),
    getLatestCommit(owner, repo).catch(() => null),
    getDefaultBranch(owner, repo).catch(() => null),
  ]);

  const isEmpty = tree.length === 0;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-gray-600">{repository.owner.name}</span>
            <span className="text-gray-400 mx-2">/</span>
            <span>{repository.name}</span>
          </h1>
          {repository.description && (
            <p className="text-gray-600 mt-2">{repository.description}</p>
          )}
        </div>

        {/* タブ */}
        <div className="border-b mb-6">
          <nav className="flex gap-4">
            <Link
              href={`/${owner}/${repo}`}
              className="px-4 py-2 border-b-2 border-blue-500 font-medium"
            >
              コード
            </Link>
            <Link
              href={`/${owner}/${repo}/specs`}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Specs
            </Link>
            <Link
              href={`/${owner}/${repo}/rules`}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Rules
            </Link>
          </nav>
        </div>

        {/* Clone URL */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 mb-2">Clone URL</p>
          <code className="bg-white px-3 py-2 rounded border block text-sm">
            git clone https://example.com/{owner}/{repo}.git
          </code>
        </div>

        {isEmpty ? (
          /* 空のリポジトリ */
          <div className="border rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">このリポジトリは空です</p>
            <div className="text-left bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-2">
                ローカルリポジトリをプッシュ:
              </p>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`git remote add origin https://example.com/${owner}/${repo}.git
git push -u origin main`}
              </pre>
            </div>
          </div>
        ) : (
          <>
            {/* 最新コミット */}
            {latestCommit && (
              <div className="border rounded-t-lg p-3 bg-gray-50 flex items-center gap-3">
                <span className="text-sm font-medium">{latestCommit.author}</span>
                <span className="text-sm text-gray-600 flex-1 truncate">
                  {latestCommit.message}
                </span>
                <span className="text-xs text-gray-500">
                  {latestCommit.date.toLocaleDateString('ja-JP')}
                </span>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {latestCommit.hash.slice(0, 7)}
                </code>
              </div>
            )}

            {/* ファイル一覧 */}
            <div className="border border-t-0 rounded-b-lg divide-y">
              {tree.map((entry) => (
                <div
                  key={entry.hash}
                  className="px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                >
                  {/* アイコン */}
                  {entry.type === 'tree' ? (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {/* ファイル名 */}
                  <Link
                    href={
                      entry.type === 'tree'
                        ? `/${owner}/${repo}/tree/${defaultBranch || 'main'}/${entry.name}`
                        : `/${owner}/${repo}/blob/${defaultBranch || 'main'}/${entry.name}`
                    }
                    className="text-blue-600 hover:underline flex-1"
                  >
                    {entry.name}
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
