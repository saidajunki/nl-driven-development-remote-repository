import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { Header } from '@/components/ui/Header';

/**
 * 設定ページ
 */

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session.user.name} userImage={session.user.image} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">設定</h1>

        <div className="space-y-4">
          {/* プロフィール */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              プロフィール
            </h2>
            <div className="flex items-center gap-4">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || ''}
                  className="w-16 h-16 rounded-2xl"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{session.user.name}</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* メニュー */}
          <nav className="bg-white rounded-2xl border border-gray-200/60 shadow-sm divide-y divide-gray-100">
            <Link
              href="/settings/tokens"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">アクセストークン</p>
                  <p className="text-sm text-gray-500">Git push 用の PAT を管理</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </nav>

          {/* ログアウト */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              アカウント
            </h2>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
