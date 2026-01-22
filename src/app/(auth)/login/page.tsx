import { signIn } from '@/lib/auth/config';

/**
 * ログインページ
 * 仕様: specs/auth-pat.md - Web UI 認証
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
        <form
          action={async () => {
            'use server';
            await signIn('github', { redirectTo: '/' });
          }}
        >
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            GitHub でログイン
          </button>
        </form>
      </div>
    </main>
  );
}
