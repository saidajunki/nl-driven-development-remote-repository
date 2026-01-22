import Link from 'next/link';
import { listRepositories } from '@/lib/repository/repository-service';

/**
 * トップページ
 * 仕様: specs/web-ui.md - リポジトリ一覧
 */

// 動的レンダリングを強制（DB接続が必要なため）
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const repositories = await listRepositories({ limit: 10 });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">NL-Driven Repository</h1>
      <p className="text-gray-600 mb-8">
        日本語仕様書・ルールを中心としたGitリモートリポジトリ
      </p>

      <section>
        <h2 className="text-xl font-semibold mb-4">リポジトリ一覧</h2>
        {repositories.length === 0 ? (
          <p className="text-gray-500">リポジトリがありません</p>
        ) : (
          <ul className="space-y-4">
            {repositories.map((repo) => (
              <li key={repo.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <Link href={`/${repo.owner.name}/${repo.name}`}>
                  <h3 className="font-medium text-blue-600 hover:underline">
                    {repo.owner.name}/{repo.name}
                  </h3>
                  {repo.description && (
                    <p className="text-gray-600 text-sm mt-1">{repo.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
