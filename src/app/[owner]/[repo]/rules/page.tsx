import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { listTree, getFileContent } from '@/lib/git/git-tree';
import { Header } from '@/components/ui/Header';
import { MarkdownViewer } from '@/components/markdown/MarkdownViewer';

/**
 * Rules ページ
 * 仕様: specs/web-ui.md - Rules の一覧、Markdown 表示、カテゴリ別集計
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ file?: string }>;
}

// ルールカテゴリの定義
const RULE_CATEGORIES: Record<string, { label: string; color: string }> = {
  security: { label: 'セキュリティ', color: 'bg-red-100 text-red-700' },
  coding: { label: 'コーディング', color: 'bg-blue-100 text-blue-700' },
  testing: { label: 'テスト', color: 'bg-green-100 text-green-700' },
  performance: { label: 'パフォーマンス', color: 'bg-yellow-100 text-yellow-700' },
  accessibility: { label: 'アクセシビリティ', color: 'bg-purple-100 text-purple-700' },
  architecture: { label: 'アーキテクチャ', color: 'bg-indigo-100 text-indigo-700' },
  git: { label: 'Git', color: 'bg-orange-100 text-orange-700' },
  always: { label: '常時適用', color: 'bg-pink-100 text-pink-700' },
};

function getCategoryFromFileName(fileName: string): string {
  const name = fileName.replace('.md', '').toLowerCase();
  return RULE_CATEGORIES[name] ? name : 'other';
}

export default async function RulesPage({ params, searchParams }: Props) {
  const { owner, repo } = await params;
  const { file } = await searchParams;
  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository) {
    notFound();
  }

  // rules/ ディレクトリのファイル一覧を取得
  const rulesFiles = await listTree(owner, repo, 'HEAD', 'rules').catch(() => []);
  const mdFiles = rulesFiles.filter(
    (f) => f.type === 'blob' && f.name.endsWith('.md')
  );

  // カテゴリ別に集計
  const categoryCount: Record<string, number> = {};
  mdFiles.forEach((f) => {
    const cat = getCategoryFromFileName(f.name);
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  // 選択されたファイルの内容を取得
  let content: string | null = null;
  let selectedFile = file;
  if (!selectedFile && mdFiles.length > 0) {
    const readme = mdFiles.find((f) => f.name.toLowerCase() === 'readme.md');
    selectedFile = readme?.name || mdFiles[0]?.name;
  }
  if (selectedFile) {
    content = await getFileContent(owner, repo, `rules/${selectedFile}`).catch(
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
              <span className="text-gray-900">rules</span>
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
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              Specs
            </Link>
            <Link
              href={`/${owner}/${repo}/rules`}
              className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              Rules
            </Link>
          </nav>
        </div>

        {mdFiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              rules/ ディレクトリがありません
            </h3>
            <p className="text-gray-500">
              リポジトリに rules/ ディレクトリを作成し、ルールを追加してください
            </p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* サイドバー */}
            <aside className="w-72 shrink-0 space-y-6">
              {/* カテゴリ別集計 */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  ルール種類
                </h2>
                <div className="space-y-2">
                  {Object.entries(categoryCount).map(([cat, count]) => {
                    const info = RULE_CATEGORIES[cat] || { label: 'その他', color: 'bg-gray-100 text-gray-700' };
                    const percentage = Math.round((count / mdFiles.length) * 100);
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${info.color}`}>
                          {info.label}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ファイル一覧 */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  ルール一覧
                </h2>
                <nav className="space-y-1">
                  {mdFiles.map((f) => {
                    const cat = getCategoryFromFileName(f.name);
                    const info = RULE_CATEGORIES[cat] || { label: 'その他', color: 'bg-gray-100 text-gray-700' };
                    return (
                      <Link
                        key={f.name}
                        href={`/${owner}/${repo}/rules?file=${f.name}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors ${
                          selectedFile === f.name
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${info.color.split(' ')[0]}`} />
                        {f.name.replace('.md', '')}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* メイン: Markdown 表示 */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200/60 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFile}
                  </span>
                  {selectedFile && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      RULE_CATEGORIES[getCategoryFromFileName(selectedFile)]?.color || 'bg-gray-100 text-gray-700'
                    }`}>
                      {RULE_CATEGORIES[getCategoryFromFileName(selectedFile)]?.label || 'その他'}
                    </span>
                  )}
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
