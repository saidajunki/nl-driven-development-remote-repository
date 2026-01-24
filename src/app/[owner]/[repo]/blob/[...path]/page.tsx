import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { getFileContent } from '@/lib/git/git-tree';
import { Header } from '@/components/ui/Header';

/**
 * ファイル表示ページ
 * 仕様: specs/file-viewer.md
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ owner: string; repo: string; path: string[] }>;
}

export default async function BlobPage({ params }: Props) {
  const { owner, repo, path: pathSegments } = await params;
  const branch = pathSegments[0] || 'main';
  const filePath = pathSegments.slice(1).join('/');

  const [repository, session] = await Promise.all([
    getRepositoryByOwnerAndName(owner, repo),
    auth(),
  ]);

  if (!repository || !filePath) {
    notFound();
  }

  const content = await getFileContent(owner, repo, filePath, branch);

  if (content === null) {
    notFound();
  }

  // パンくずリスト用
  const pathParts = filePath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const dirParts = pathParts.slice(0, -1);

  // 行数
  const lines = content.split('\n');

  // ファイル拡張子から言語を推測
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    html: 'html',
    css: 'css',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sh: 'bash',
    bash: 'bash',
  };
  const language = languageMap[ext] || 'text';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session?.user?.name} userImage={session?.user?.image} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* パンくずリスト */}
        <div className="flex items-center gap-2 text-sm mb-4 flex-wrap">
          <Link href={`/${owner}/${repo}`} className="text-blue-600 hover:underline">
            {repo}
          </Link>
          {dirParts.map((part, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              <Link
                href={`/${owner}/${repo}/tree/${branch}/${dirParts.slice(0, i + 1).join('/')}`}
                className="text-blue-600 hover:underline"
              >
                {part}
              </Link>
            </span>
          ))}
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{fileName}</span>
        </div>

        {/* ファイル情報 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/${owner}/${repo}/branches`}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
            >
              🌿 {branch}
            </Link>
            <span className="text-sm text-gray-500">{lines.length} 行</span>
          </div>
          <Link
            href={`/${owner}/${repo}/raw/${branch}/${filePath}`}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
          >
            Raw
          </Link>
        </div>

        {/* ファイル内容 */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-0.5 text-right text-gray-400 select-none border-r border-gray-100 w-12">
                      {i + 1}
                    </td>
                    <td className="px-4 py-0.5 whitespace-pre text-gray-800">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
