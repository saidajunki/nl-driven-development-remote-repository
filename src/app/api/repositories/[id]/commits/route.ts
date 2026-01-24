import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { listCommits } from '@/lib/git/commit-service';

/**
 * コミット一覧 API
 * 仕様: specs/commit-history.md
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const branch = searchParams.get('branch') || undefined;
  const limit = parseInt(searchParams.get('limit') || '30', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  const repo = await prisma.repository.findUnique({
    where: { id },
    include: { owner: { select: { name: true } } },
  });

  if (!repo || !repo.owner.name) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
  }

  const { commits, hasMore } = await listCommits(repo.owner.name, repo.name, {
    branch,
    limit,
    skip: (page - 1) * limit,
  });

  return NextResponse.json({ commits, hasMore, page });
}
