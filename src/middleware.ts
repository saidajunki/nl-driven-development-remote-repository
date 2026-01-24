import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Git Smart HTTP URL リライト
 * /<owner>/<repo>.git/* -> /api/git/<owner>/<repo>.git/*
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // /<owner>/<repo>.git パターンをマッチ
  const gitRepoMatch = pathname.match(/^\/([^/]+)\/([^/]+\.git)(\/.*)?$/);
  
  if (gitRepoMatch) {
    const owner = gitRepoMatch[1];
    const repo = gitRepoMatch[2];
    const rest = gitRepoMatch[3] || '';
    
    // /api/git/<owner>/<repo>.git/... にリライト
    const newUrl = new URL(`/api/git/${owner}/${repo}${rest}`, request.url);
    newUrl.search = request.nextUrl.search;
    
    return NextResponse.rewrite(newUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // .git で終わるパスをマッチ
    '/:owner/:repo*.git/:path*',
    '/:owner/:repo*.git',
  ],
};
