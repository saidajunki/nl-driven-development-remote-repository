import { auth } from '@/lib/auth/config';
import { listRepositories } from '@/lib/repository/repository-service';
import { LandingPage } from '@/components/landing/LandingPage';
import { Dashboard } from '@/components/dashboard/Dashboard';

/**
 * トップページ
 * 仕様: specs/web-ui.md
 * - 未ログイン: ランディングページ（サービス紹介）
 * - ログイン後: ダッシュボード（リポジトリ一覧）
 */

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();

  // 未ログイン: ランディングページ
  if (!session?.user) {
    return <LandingPage />;
  }

  // ログイン後: ダッシュボード
  const repositories = await listRepositories({
    ownerId: session.user.id,
    limit: 20,
  });

  return <Dashboard repositories={repositories} userName={session.user.name} userImage={session.user.image} />;
}
