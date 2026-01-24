import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { listPullRequests } from '@/lib/pull-request/pull-request-service';
import { Header } from '@/components/ui/Header';
import { PullRequestStatus } from '@prisma/client';

/**
 * Pull Request 一覧ページ
 * 仕様: specs/pull-request.md
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function PullRequestsPage({ params, searchParams }: Props) {
  const { owner, repo } = await params;
  const { status: statusParam } = await searchParams;

  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository) {
    notFound();
  }

  let status: PullRequestStatus | 'all' = 'OPEN';
  if (statusParam === 'closed') status = 'CLOSED';
  else if (statusParam === 'merged') status = 'MERGED';
  else if (statusParam === 'all') status = 'all';

  const pullRequests = await listPullRequests(repository.id, { status });

  const statusColors = {
    OPEN: 'bg-green-100 text-green-700',
    MERGED: 'bg-purple-100 text-purple-700',
    CLOSED: 'bg-red-100 text-red-700',
  };

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
              <span>pulls</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pull Requests</h1>
          </div>
          {session?.user && (
            <Link
              href={`/${owner}/${repo}/pulls/new`}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
            >
              New Pull Request
            </Link>
          )}
        </div>

        {/* フィルター */}
        <div className="flex gap-2 mb-4">
          {(['open', 'merged', 'closed', 'all'] as const).map((s) => (
            <Link
              key={s}
              href={`/${owner}/${repo}/pulls?status=${s}`}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                (statusParam || 'open') === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'open' ? 'Open' : s === 'merged' ? 'Merged' : s === 'closed' ? 'Closed' : 'All'}
            </Link>
          ))}
        </div>

        {/* PR 一覧 */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          {pullRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Pull Request がありません
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pullRequests.map((pr) => (
                <Link
                  key={pr.id}
                  href={`/${owner}/${repo}/pull/${pr.number}`}
                  className="block px-4 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[pr.status]}`}
                    >
                      {pr.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        #{pr.number} {pr.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {pr.author.name} • {pr.sourceBranch} → {pr.targetBranch}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {pr.createdAt.toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
