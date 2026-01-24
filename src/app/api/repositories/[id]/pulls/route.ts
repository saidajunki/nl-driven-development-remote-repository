import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import {
  createPullRequest,
  listPullRequests,
} from '@/lib/pull-request/pull-request-service';
import { PullRequestStatus } from '@prisma/client';

/**
 * Pull Request API
 * 仕様: specs/pull-request.md
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const statusParam = searchParams.get('status') || 'open';

  let status: PullRequestStatus | 'all' = 'all';
  if (statusParam === 'open') status = 'OPEN';
  else if (statusParam === 'closed') status = 'CLOSED';
  else if (statusParam === 'merged') status = 'MERGED';

  const pullRequests = await listPullRequests(id, { status });

  return NextResponse.json({ pullRequests });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // リポジトリの存在確認
  const repo = await prisma.repository.findUnique({
    where: { id },
  });

  if (!repo) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, sourceBranch, targetBranch } = body;

  if (!title || !sourceBranch || !targetBranch) {
    return NextResponse.json(
      { error: 'title, sourceBranch, targetBranch are required' },
      { status: 400 }
    );
  }

  try {
    const pr = await createPullRequest({
      repositoryId: id,
      title,
      description,
      sourceBranch,
      targetBranch,
      authorId: session.user.id,
    });

    return NextResponse.json({ pullRequest: pr }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PR' },
      { status: 500 }
    );
  }
}
