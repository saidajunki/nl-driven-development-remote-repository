import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { createPat, listPats } from '@/lib/auth/pat-service';
import { z } from 'zod';

/**
 * PAT API
 * 仕様: specs/auth-pat.md - PAT 発行（UI）
 */

const createPatSchema = z.object({
  name: z.string().min(1).max(100),
  expiresInDays: z.number().int().positive().optional(),
});

/**
 * PAT 一覧取得
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const pats = await listPats(session.user.id);
  return NextResponse.json({ pats });
}

/**
 * PAT 作成
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'バリデーションエラー', details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { name, expiresInDays } = parsed.data;
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const { plainToken, pat } = await createPat({
    name,
    userId: session.user.id,
    expiresAt,
  });

  // 平文トークンは作成時のみ返す
  return NextResponse.json({ token: plainToken, pat }, { status: 201 });
}
