import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { listBranches } from '@/lib/git/branch-service';
import { Header } from '@/components/ui/Header';

/**
 * ブランチ一覧ページ
 * 仕様: specs/branch-management.md
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function BranchesPage({ params }: Props) {
  const { owner, repo } = await params;
  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository) {
    notFound();
  }

  const branches = await listBranches(owner, repo);

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
              <span>branches</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ブランチ</h1>
          </div>
        </div>

        {/* ブランチ一覧 */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          {branches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              ブランチがありません
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <Link
                      href={`/${owner}/${repo}/tree/${branch.name}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {branch.name}
                    </Link>
                    {branch.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        default
                      </span>
                    )}
                  </div>
                  {branch.lastCommit && (
                    <div className="text-sm text-gray-500">
                      <span className="mr-2">{branch.lastCommit.author}</span>
                      <span>
                        {branch.lastCommit.date.toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
