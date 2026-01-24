import { NextRequest, NextResponse } from 'next/server';
import { getPullRequest } from '@/lib/pull-request/pull-request-service';

/**
 * Pull Request 詳細 API
 * 仕様: specs/pull-request.md
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; number: string }> }
) {
  const { id, number } = await params;
  const prNumber = parseInt(number, 10);

  if (isNaN(prNumber)) {
    return NextResponse.json({ error: 'Invalid PR number' }, { status: 400 });
  }

  const pr = await getPullRequest(id, prNumber);

  if (!pr) {
    return NextResponse.json({ error: 'PR not found' }, { status: 404 });
  }

  return NextResponse.json({ pullRequest: pr });
}
