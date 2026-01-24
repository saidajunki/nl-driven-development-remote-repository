import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { listBranches } from '@/lib/git/branch-service';

/**
 * ブランチ一覧 API
 * 仕様: specs/branch-management.md
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const repo = await prisma.repository.findUnique({
    where: { id },
    include: { owner: { select: { name: true } } },
  });

  if (!repo || !repo.owner.name) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
  }

  const branches = await listBranches(repo.owner.name, repo.name);

  return NextResponse.json({ branches });
}
