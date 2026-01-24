import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { listCommits } from '@/lib/git/commit-service';
import { Header } from '@/components/ui/Header';

/**
 * コミット一覧ページ
 * 仕様: specs/commit-history.md
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ branch?: string; page?: string }>;
}

export default async function CommitsPage({ params, searchParams }: Props) {
  const { owner, repo } = await params;
  const { branch, page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10);

  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository) {
    notFound();
  }

  const { commits, hasMore } = await listCommits(owner, repo, {
    branch,
    limit: 30,
    skip: (page - 1) * 30,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session?.user?.name} userImage={session?.user?.image} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href={`/${owner}/${repo}`} className="hover:text-blue-600">
                {owner}/{repo}
              </Link>
              <span>/</span>
              <span>commits</span>
              {branch && (
                <>
                  <span>/</span>
                  <span>{branch}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">コミット履歴</h1>
          </div>
        </div>

        {/* コミット一覧 */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          {commits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              コミットがありません
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {commits.map((commit) => (
                <div key={commit.hash} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${owner}/${repo}/commit/${commit.hash}`}
                        className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                      >
                        {commit.message}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{commit.author.name}</span>
                        <span>•</span>
                        <span>{commit.date.toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg font-mono text-gray-600">
                      {commit.shortHash}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ページネーション */}
        {(page > 1 || hasMore) && (
          <div className="flex justify-center gap-4 mt-6">
            {page > 1 && (
              <Link
                href={`/${owner}/${repo}/commits?page=${page - 1}${branch ? `&branch=${branch}` : ''}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50"
              >
                前のページ
              </Link>
            )}
            {hasMore && (
              <Link
                href={`/${owner}/${repo}/commits?page=${page + 1}${branch ? `&branch=${branch}` : ''}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50"
              >
                次のページ
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
