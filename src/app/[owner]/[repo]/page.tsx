import { notFound } from 'next/navigation';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';

/**
 * リポジトリ詳細ページ
 * 仕様: specs/web-ui.md - リポジトリ詳細
 * URL: https://<host>/<owner>/<repo>
 */

// 動的レンダリングを強制（DB接続が必要なため）
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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-gray-600">{repository.owner.name}</span>
            <span className="text-gray-400 mx-2">/</span>
            <span>{repository.name}</span>
          </h1>
          {repository.description && (
            <p className="text-gray-600 mt-2">{repository.description}</p>
          )}
        </div>

        {/* タブ（将来実装） */}
        <div className="border-b mb-6">
          <nav className="flex gap-4">
            <button className="px-4 py-2 border-b-2 border-blue-500 font-medium">
              概要
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Specs
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Rules
            </button>
          </nav>
        </div>

        {/* Clone URL */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 mb-2">Clone URL</p>
          <code className="bg-white px-3 py-2 rounded border block">
            {`git clone https://example.com/${owner}/${repo}.git`}
          </code>
        </div>

        {/* メタ情報 */}
        <div className="text-sm text-gray-500">
          <p>作成日: {repository.createdAt.toLocaleDateString('ja-JP')}</p>
          <p>更新日: {repository.updatedAt.toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    </main>
  );
}
