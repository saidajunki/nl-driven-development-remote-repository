import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingPage } from '@/components/landing/LandingPage';
import { Dashboard } from '@/components/dashboard/Dashboard';

// Framer Motion のモック
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
    h1: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <h1 {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <h2 {...props}>{children}</h2>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <p {...props}>{children}</p>
    ),
  },
}));

describe('トップページ', () => {
  // 仕様: specs/web-ui.md

  describe('LandingPage（未ログイン時）', () => {
    it('サービス名が表示される', () => {
      render(<LandingPage />);
      expect(screen.getByText('git-nl')).toBeInTheDocument();
    });

    it('ログインリンクが表示される', () => {
      render(<LandingPage />);
      expect(screen.getByRole('link', { name: 'ログイン' })).toBeInTheDocument();
    });

    it('特徴セクションが表示される', () => {
      render(<LandingPage />);
      expect(screen.getByText('なぜ git-nl？')).toBeInTheDocument();
    });
  });

  describe('Dashboard（ログイン後）', () => {
    it('リポジトリ一覧が表示される', () => {
      const repos = [
        {
          id: '1',
          name: 'test-repo',
          description: 'テストリポジトリ',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: { id: 'user1', name: 'testuser' },
        },
      ];
      render(<Dashboard repositories={repos} userName="testuser" userImage={null} />);
      expect(screen.getByText('testuser/test-repo')).toBeInTheDocument();
    });

    it('リポジトリがない場合はメッセージが表示される', () => {
      render(<Dashboard repositories={[]} userName="testuser" userImage={null} />);
      expect(screen.getByText('リポジトリがありません')).toBeInTheDocument();
    });
  });
});
