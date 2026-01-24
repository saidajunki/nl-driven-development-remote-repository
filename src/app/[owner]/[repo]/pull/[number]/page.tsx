import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { getPullRequest } from '@/lib/pull-request/pull-request-service';
import { getDiff } from '@/lib/git/commit-service';
import { Header } from '@/components/ui/Header';
import { PullRequestActions } from '@/components/pull-request/PullRequestActions';

/**
 * Pull Request 詳細ページ
 * 仕様: specs/pull-request.md
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ owner: string; repo: string; number: string }>;
}

export default async function PullRequestPage({ params }: Props) {
  const { owner, repo, number } = await params;
  const prNumber = parseInt(number, 10);

  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository || isNaN(prNumber)) {
    notFound();
  }

  const pr = await getPullRequest(repository.id, prNumber);

  if (!pr) {
    notFound();
  }

  // 差分を取得
  const diff = await getDiff(owner, repo, pr.targetBranch, pr.sourceBranch);

  const statusColors = {
    OPEN: 'bg-green-100 text-green-700 border-green-200',
    MERGED: 'bg-purple-100 text-purple-700 border-purple-200',
    CLOSED: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session?.user?.name} userImage={session?.user?.image} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href={`/${owner}/${repo}`} className="hover:text-blue-600">
              {owner}/{repo}
            </Link>
            <span>/</span>
            <Link href={`/${owner}/${repo}/pulls`} className="hover:text-blue-600">
              pulls
            </Link>
            <span>/</span>
            <span>#{prNumber}</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{pr.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColors[pr.status]}`}
                >
                  {pr.status}
                </span>
                <span className="text-gray-500">
                  {pr.author.name} wants to merge{' '}
                  <code className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                    {pr.sourceBranch}
                  </code>{' '}
                  into{' '}
                  <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {pr.targetBranch}
                  </code>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        {session?.user && pr.status === 'OPEN' && (
          <PullRequestActions
            repositoryId={repository.id}
            prNumber={prNumber}
            owner={owner}
            repo={repo}
          />
        )}

        {/* 説明 */}
        {pr.description && (
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">説明</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{pr.description}</p>
          </div>
        )}

        {/* 差分 */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">変更内容</h2>
          </div>
          {diff ? (
            <pre className="p-4 text-sm font-mono overflow-x-auto bg-gray-900 text-gray-100">
              {diff.split('\n').map((line, i) => {
                let className = '';
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  className = 'text-green-400 bg-green-900/30';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  className = 'text-red-400 bg-red-900/30';
                } else if (line.startsWith('@@')) {
                  className = 'text-blue-400';
                } else if (line.startsWith('diff') || line.startsWith('index')) {
                  className = 'text-gray-500';
                }
                return (
                  <div key={i} className={className}>
                    {line}
                  </div>
                );
              })}
            </pre>
          ) : (
            <div className="p-8 text-center text-gray-500">
              差分がありません
            </div>
          )}
        </div>

        {/* メタ情報 */}
        <div className="mt-6 text-sm text-gray-500">
          <p>作成: {pr.createdAt.toLocaleString('ja-JP')}</p>
          {pr.mergedAt && (
            <p>
              マージ: {pr.mergedAt.toLocaleString('ja-JP')} by {pr.mergedBy?.name}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
