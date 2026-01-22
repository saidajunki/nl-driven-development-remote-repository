import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { deleteRepository } from '@/lib/repository/repository-service';
import { prisma } from '@/lib/db/prisma';

/**
 * リポジトリ個別操作 API
 * 仕様: specs/git-service.md
 */

/**
 * リポジトリ詳細取得
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const repository = await prisma.repository.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      analytics: true,
    },
  });

  if (!repository) {
    return NextResponse.json({ error: 'リポジトリが見つかりません' }, { status: 404 });
  }

  return NextResponse.json({ repository });
}

/**
 * リポジトリ削除
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
  const deleted = await deleteRepository(id, session.user.id);

  if (!deleted) {
    return NextResponse.json(
      { error: 'リポジトリが見つからないか、削除権限がありません' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
