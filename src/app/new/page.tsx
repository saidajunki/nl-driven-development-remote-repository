import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { Header } from '@/components/ui/Header';
import { NewRepositoryForm } from '@/components/repository/NewRepositoryForm';

/**
 * 新規リポジトリ作成ページ
 * 仕様: specs/git-service.md - Web UI で事前作成が必須
 */

export const dynamic = 'force-dynamic';

export default async function NewRepositoryPage() {
  const session = await auth();

  // 未ログインはログインページへ
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header userName={session.user.name} userImage={session.user.image} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          新規リポジトリを作成
        </h1>

        <NewRepositoryForm userName={session.user.name || ''} />
      </main>
    </div>
  );
}
