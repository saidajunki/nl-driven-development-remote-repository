import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { mergePullRequest } from '@/lib/pull-request/pull-request-service';

/**
 * Pull Request マージ API
 * 仕様: specs/pull-request.md
 */

export async function POST(
  request: NextRequest,
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

  const body = await request.json().catch(() => ({}));
  const mergeMethod = body.mergeMethod === 'squash' ? 'squash' : 'merge';

  const result = await mergePullRequest(id, prNumber, session.user.id, mergeMethod);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
