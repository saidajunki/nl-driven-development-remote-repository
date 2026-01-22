import Link from 'next/link';
import type { RepositoryInfo } from '@/lib/repository/repository-service';

/**
 * ダッシュボード（ログイン後）
 * 仕様: specs/web-ui.md - ダッシュボード
 */

interface Props {
  repositories: RepositoryInfo[];
  userName: string | null | undefined;
}

export function Dashboard({ repositories, userName }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            NL-Driven
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{userName}</span>
            <Link
              href="/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              新規リポジトリ
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">リポジトリ</h1>

        {repositories.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-500 mb-4">リポジトリがありません</p>
            <Link
              href="/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              最初のリポジトリを作成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {repositories.map((repo) => (
              <Link
                key={repo.id}
                href={`/${repo.owner.name}/${repo.name}`}
                className="block bg-white rounded-lg border p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-600 hover:underline">
                      {repo.owner.name}/{repo.name}
                    </h2>
                    {repo.description && (
                      <p className="text-gray-600 mt-1">{repo.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      repo.isPublic
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {repo.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  更新: {repo.updatedAt.toLocaleDateString('ja-JP')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
