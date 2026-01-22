import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { listTree, getLatestCommit, getDefaultBranch } from '@/lib/git/git-tree';
import { Header } from '@/components/ui/Header';

/**
 * リポジトリ詳細ページ
 * 仕様: specs/web-ui.md - リポジトリ詳細
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
  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository) {
    notFound();
  }

  const [tree, latestCommit, defaultBranch] = await Promise.all([
    listTree(owner, repo).catch(() => []),
    getLatestCommit(owner, repo).catch(() => null),
    getDefaultBranch(owner, repo).catch(() => null),
  ]);

  const isEmpty = tree.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session?.user?.name} userImage={session?.user?.image} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* リポジトリヘッダー */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  <Link href={`/${owner}`} className="text-blue-600 hover:underline">
                    {repository.owner.name}
                  </Link>
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-900">{repository.name}</span>
                </h1>
                {repository.description && (
                  <p className="text-gray-600 mt-1">{repository.description}</p>
                )}
              </div>
            </div>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                repository.isPublic
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {repository.isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          {/* タブナビゲーション */}
          <nav className="flex items-center gap-1 mt-6 -mb-6 border-b border-gray-200">
            <Link
              href={`/${owner}/${repo}`}
              className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                コード
              </span>
            </Link>
            <Link
              href={`/${owner}/${repo}/specs`}
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Specs
              </span>
            </Link>
            <Link
              href={`/${owner}/${repo}/rules`}
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Rules
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0">
            {/* Clone URL */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Clone</span>
                <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
                  <code className="text-sm text-gray-600 flex-1 truncate">
                    https://example.com/{owner}/{repo}.git
                  </code>
                  <button
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    title="コピー"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {isEmpty ? (
              /* 空のリポジトリ */
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  このリポジトリは空です
                </h3>
                <p className="text-gray-500 mb-6">
                  ローカルリポジトリをプッシュして始めましょう
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left max-w-md mx-auto">
                  <p className="text-xs text-gray-500 mb-2">既存のリポジトリをプッシュ:</p>
                  <pre className="text-sm text-gray-700 overflow-x-auto">
{`git remote add origin https://example.com/${owner}/${repo}.git
git push -u origin main`}
                  </pre>
                </div>
              </div>
            ) : (
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

                {/* ファイル一覧 */}
                <div className="divide-y divide-gray-100">
                  {tree.map((entry) => (
                    <Link
                      key={entry.hash}
                      href={
                        entry.type === 'tree'
                          ? `/${owner}/${repo}/tree/${defaultBranch || 'main'}/${entry.name}`
                          : `/${owner}/${repo}/blob/${defaultBranch || 'main'}/${entry.name}`
                      }
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      {entry.type === 'tree' ? (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="text-sm text-gray-900 hover:text-blue-600 hover:underline">
                        {entry.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <aside className="lg:w-80 shrink-0 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-sm text-gray-600 mb-4">
                {repository.description || '説明がありません'}
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  作成: {repository.createdAt.toLocaleDateString('ja-JP')}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  更新: {repository.updatedAt.toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>

            {/* 統計（将来実装） */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">統計</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-xs text-gray-500">Specs</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-xs text-gray-500">Rules</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
