import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

// Prisma をモック
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    repository: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe('HomePage', () => {
  // 仕様: specs/web-ui.md - トップページ
  it('タイトルが表示される', async () => {
    const Component = await HomePage();
    render(Component);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'NL-Driven Repository'
    );
  });

  it('説明文が表示される', async () => {
    const Component = await HomePage();
    render(Component);
    expect(
      screen.getByText('日本語仕様書・ルールを中心としたGitリモートリポジトリ')
    ).toBeInTheDocument();
  });

  it('リポジトリ一覧セクションが表示される', async () => {
    const Component = await HomePage();
    render(Component);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'リポジトリ一覧'
    );
  });
});
