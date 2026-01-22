import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'git-nl',
  description: '日本語仕様書・ルールを中心としたGitリモートリポジトリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
