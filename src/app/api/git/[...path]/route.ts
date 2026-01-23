import { NextRequest, NextResponse } from 'next/server';
import { authenticateGitRequest } from '@/lib/git/git-auth';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';

/**
 * Git Smart HTTP プロキシ
 * 仕様: specs/git-service.md
 * - clone/fetch は誰でも可能（public）
 * - push は認証済みユーザーのみ可能
 */

const GIT_SERVER_URL = process.env.GIT_SERVER_URL || 'http://git:80';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleGitRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleGitRequest(request, path, 'POST');
}

async function handleGitRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
): Promise<NextResponse> {
  // パスを解析: /api/git/owner/repo.git/...
  if (pathSegments.length < 2) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const owner = pathSegments[0]!;
  let repoName = pathSegments[1]!;
  const gitPath = pathSegments.slice(2).join('/');

  // .git を除去
  if (repoName.endsWith('.git')) {
    repoName = repoName.slice(0, -4);
  }

  // リポジトリの存在確認
  const repo = await getRepositoryByOwnerAndName(owner, repoName);
  if (!repo) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
  }


  // push（git-receive-pack）は認証必須
  const isPush = gitPath.includes('git-receive-pack');
  if (isPush) {
    const authHeader = request.headers.get('authorization');
    const user = await authenticateGitRequest(authHeader);

    if (!user) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="git-nl"',
        },
      });
    }

    // TODO: ユーザーがこのリポジトリに push 権限があるか確認
    // MVP では PAT を持つユーザーは push 可能
  }

  // Git サーバーにプロキシ
  const targetUrl = `${GIT_SERVER_URL}/${owner}/${repoName}.git/${gitPath}`;

  try {
    const headers = new Headers();
    // 必要なヘッダーを転送
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: method === 'POST' ? request.body : undefined,
      // @ts-expect-error - duplex is required for streaming
      duplex: 'half',
    });

    // レスポンスを転送
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Git proxy error:', error);
    return NextResponse.json({ error: 'Git server error' }, { status: 502 });
  }
}
