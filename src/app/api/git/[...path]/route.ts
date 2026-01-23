import { NextRequest, NextResponse } from 'next/server';
import { authenticateGitRequest } from '@/lib/git/git-auth';
import { getRepositoryByOwnerAndName } from '@/lib/repository/repository-service';
import { getRepoPath } from '@/lib/git/git-service';
import { spawn } from 'child_process';

/**
 * Git Smart HTTP サーバー
 * 仕様: specs/git-service.md
 * - clone/fetch は誰でも可能（public）
 * - push は認証済みユーザーのみ可能
 * 
 * git-http-backend を直接実行して Git Smart HTTP を提供
 */

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
  let authenticatedUser: string | null = null;
  
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
    authenticatedUser = user.userName || 'unknown';
  }

  // Git コマンドを直接実行
  const repoPath = getRepoPath(owner, repoName);
  
  // info/refs?service=xxx の処理
  if (gitPath === 'info/refs') {
    const service = request.nextUrl.searchParams.get('service');
    if (service === 'git-upload-pack' || service === 'git-receive-pack') {
      return handleInfoRefs(repoPath, service);
    }
    return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
  }

  // git-upload-pack / git-receive-pack の処理
  if (gitPath === 'git-upload-pack' || gitPath === 'git-receive-pack') {
    const body = await request.arrayBuffer();
    return handleGitService(repoPath, gitPath, Buffer.from(body), authenticatedUser);
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * info/refs エンドポイント
 * Git クライアントが最初にアクセスして、サーバーの capabilities を取得
 */
async function handleInfoRefs(
  repoPath: string,
  service: string
): Promise<NextResponse> {
  return new Promise((resolve) => {
    const args = service === 'git-upload-pack' 
      ? ['upload-pack', '--stateless-rpc', '--advertise-refs', repoPath]
      : ['receive-pack', '--stateless-rpc', '--advertise-refs', repoPath];

    const git = spawn('git', args);
    const chunks: Buffer[] = [];

    git.stdout.on('data', (data) => chunks.push(data));
    git.stderr.on('data', (data) => console.error('git stderr:', data.toString()));

    git.on('close', (code) => {
      if (code !== 0) {
        resolve(NextResponse.json({ error: 'Git error' }, { status: 500 }));
        return;
      }

      const output = Buffer.concat(chunks);
      // Smart HTTP のヘッダーを追加
      const header = `# service=${service}\n`;
      const headerPkt = pktLine(header) + '0000';
      const body = Buffer.concat([Buffer.from(headerPkt), output]);

      resolve(new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': `application/x-${service}-advertisement`,
          'Cache-Control': 'no-cache',
        },
      }));
    });

    git.on('error', (err) => {
      console.error('Git spawn error:', err);
      resolve(NextResponse.json({ error: 'Git error' }, { status: 500 }));
    });
  });
}

/**
 * git-upload-pack / git-receive-pack エンドポイント
 * 実際のデータ転送を処理
 */
async function handleGitService(
  repoPath: string,
  service: string,
  input: Buffer,
  _authenticatedUser: string | null
): Promise<NextResponse> {
  return new Promise((resolve) => {
    const command = service === 'git-upload-pack' ? 'upload-pack' : 'receive-pack';
    const git = spawn('git', [command, '--stateless-rpc', repoPath]);
    const chunks: Buffer[] = [];

    git.stdout.on('data', (data) => chunks.push(data));
    git.stderr.on('data', (data) => console.error('git stderr:', data.toString()));

    git.on('close', (code) => {
      const output = Buffer.concat(chunks);
      
      if (code !== 0 && output.length === 0) {
        resolve(NextResponse.json({ error: 'Git error' }, { status: 500 }));
        return;
      }

      resolve(new NextResponse(output, {
        status: 200,
        headers: {
          'Content-Type': `application/x-${service}-result`,
          'Cache-Control': 'no-cache',
        },
      }));
    });

    git.on('error', (err) => {
      console.error('Git spawn error:', err);
      resolve(NextResponse.json({ error: 'Git error' }, { status: 500 }));
    });

    // リクエストボディを git プロセスに送信
    git.stdin.write(input);
    git.stdin.end();
  });
}

/**
 * Git pkt-line 形式でエンコード
 */
function pktLine(data: string): string {
  const length = (data.length + 4).toString(16).padStart(4, '0');
  return length + data;
}
