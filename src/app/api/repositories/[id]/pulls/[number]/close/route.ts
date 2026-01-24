import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { closePullRequest } from '@/lib/pull-request/pull-request-service';

/**
 * Pull Request クローズ API
 * 仕様: specs/pull-request.md
 */

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; number: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, number } = await params;
  const prNumber = parseInt(number, 10);

  if (isNaN(prNumber)) {
    return NextResponse.json({ error: 'Invalid PR number' }, { status: 400 });
  }

  const success = await closePullRequest(id, prNumber);

  if (!success) {
    return NextResponse.json({ error: 'Failed to close PR' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
