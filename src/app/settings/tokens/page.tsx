import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { listPats } from '@/lib/auth/pat-service';
import { Header } from '@/components/ui/Header';
import { TokenList } from '@/components/settings/TokenList';
import { CreateTokenForm } from '@/components/settings/CreateTokenForm';

/**
 * PAT 管理ページ
 * 仕様: specs/auth-pat.md - PAT 発行（UI）
 */

export const dynamic = 'force-dynamic';

export default async function TokensPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const pats = await listPats(session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session.user.name} userImage={session.user.image} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              アクセストークン
            </h1>
            <p className="text-gray-600 mt-1">
              Git push 時の認証に使用する Personal Access Token を管理します
            </p>
          </div>
        </div>

        {/* 新規作成フォーム */}
        <CreateTokenForm />

        {/* トークン一覧 */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            発行済みトークン
          </h2>
          <TokenList initialPats={pats} />
        </div>

        {/* 使い方 */}
        <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">使い方</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>Git push 時に PAT をパスワードとして使用します：</p>
            <pre className="bg-blue-100 rounded-xl p-3 overflow-x-auto text-xs">
{`# クローン時に認証情報を含める
git clone https://username:YOUR_TOKEN@git-nl.example.com/owner/repo.git

# または credential helper を使用
git config credential.helper store
git push  # 初回のみユーザー名と PAT を入力`}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
