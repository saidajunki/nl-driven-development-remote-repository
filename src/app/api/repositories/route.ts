import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  createRepository,
  listRepositories,
  isValidRepositoryName,
} from '@/lib/repository/repository-service';
import { z } from 'zod';

/**
 * リポジトリ API
 * 仕様: specs/git-service.md - リポジトリ作成は Web UI で事前作成が必須
 */

const createRepoSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

/**
 * リポジトリ一覧取得
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get('ownerId') ?? undefined;
  const limit = searchParams.get('limit')
    ? parseInt(searchParams.get('limit')!, 10)
    : undefined;
  const offset = searchParams.get('offset')
    ? parseInt(searchParams.get('offset')!, 10)
    : undefined;

  const repositories = await listRepositories({ ownerId, limit, offset });
  return NextResponse.json({ repositories });
}

/**
 * リポジトリ作成
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createRepoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'バリデーションエラー', details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { name, description, isPublic } = parsed.data;

  if (!isValidRepositoryName(name)) {
    return NextResponse.json(
      { error: 'リポジトリ名は英数字、ハイフン、アンダースコアのみ使用できます' },
      { status: 400 }
    );
  }

  try {
    const repository = await createRepository({
      name,
      description,
      ownerId: session.user.id,
      isPublic,
    });

    return NextResponse.json({ repository }, { status: 201 });
  } catch (error) {
    // 重複エラーの場合
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        { error: '同名のリポジトリが既に存在します' },
        { status: 409 }
      );
    }
    throw error;
  }
}
