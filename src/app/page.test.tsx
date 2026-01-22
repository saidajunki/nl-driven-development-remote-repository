import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  // 仕様: specs/web-ui.md - トップページ
  it('タイトルが表示される', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'NL-Driven Repository'
    );
  });

  it('説明文が表示される', () => {
    render(<HomePage />);
    expect(
      screen.getByText('日本語仕様書・ルールを中心としたGitリモートリポジトリ')
    ).toBeInTheDocument();
  });
});
