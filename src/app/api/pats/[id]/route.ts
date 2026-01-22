import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { revokePat } from '@/lib/auth/pat-service';

/**
 * PAT 個別操作 API
 * 仕様: specs/auth-pat.md - PAT 発行（UI）
 */

/**
 * PAT 失効（削除）
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await revokePat(id, session.user.id);

  if (!deleted) {
    return NextResponse.json({ error: 'PAT が見つかりません' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
