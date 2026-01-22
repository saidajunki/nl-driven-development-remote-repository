import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { listTree, getFileContent, getDefaultBranch } from '@/lib/git/git-tree';
import { Header } from '@/components/ui/Header';
import { MarkdownViewer } from '@/components/markdown/MarkdownViewer';

/**
 * Specs ページ
 * 仕様: specs/web-ui.md - Specs の目次表示、Markdown 表示
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ file?: string }>;
}

export default async function SpecsPage({ params, searchParams }: Props) {
  const { owner, repo } = await params;
  const { file } = await searchParams;
  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository) {
    notFound();
  }

  // specs/ ディレクトリのファイル一覧を取得
  const specsFiles = await listTree(owner, repo, 'HEAD', 'specs').catch(() => []);
  const mdFiles = specsFiles.filter(
    (f) => f.type === 'blob' && f.name.endsWith('.md')
  );

  // 選択されたファイルの内容を取得
  let content: string | null = null;
  let selectedFile = file;
  if (!selectedFile && mdFiles.length > 0) {
    // デフォルトで README.md または最初のファイルを表示
    const readme = mdFiles.find((f) => f.name.toLowerCase() === 'readme.md');
    selectedFile = readme?.name || mdFiles[0]?.name;
  }
  if (selectedFile) {
    content = await getFileContent(owner, repo, `specs/${selectedFile}`).catch(
      () => null
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session?.user?.name} userImage={session?.user?.image} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* リポジトリヘッダー */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold">
              <Link href={`/${owner}`} className="text-blue-600 hover:underline">
                {owner}
              </Link>
              <span className="text-gray-400 mx-2">/</span>
              <Link href={`/${owner}/${repo}`} className="text-blue-600 hover:underline">
                {repo}
              </Link>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-900">specs</span>
            </h1>
          </div>

          {/* タブ */}
          <nav className="flex items-center gap-1 -mb-6 border-b border-gray-200">
            <Link
              href={`/${owner}/${repo}`}
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              コード
            </Link>
            <Link
              href={`/${owner}/${repo}/specs`}
              className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              Specs
            </Link>
            <Link
              href={`/${owner}/${repo}/rules`}
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              Rules
            </Link>
          </nav>
        </div>

        {mdFiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              specs/ ディレクトリがありません
            </h3>
            <p className="text-gray-500">
              リポジトリに specs/ ディレクトリを作成し、仕様書を追加してください
            </p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* サイドバー: ファイル一覧 */}
            <aside className="w-64 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  仕様書一覧
                </h2>
                <nav className="space-y-1">
                  {mdFiles.map((f) => (
                    <Link
                      key={f.name}
                      href={`/${owner}/${repo}/specs?file=${f.name}`}
                      className={`block px-3 py-2 text-sm rounded-xl transition-colors ${
                        selectedFile === f.name
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {f.name.replace('.md', '')}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* メイン: Markdown 表示 */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200/60">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFile}
                  </span>
                </div>
                <div className="p-6">
                  {content ? (
                    <MarkdownViewer content={content} />
                  ) : (
                    <p className="text-gray-500">ファイルを読み込めませんでした</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
