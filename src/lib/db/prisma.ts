import { PrismaClient } from '@prisma/client';

/**
 * Prisma クライアントのシングルトンインスタンス
 * 開発時のホットリロードで複数インスタンスが生成されるのを防ぐ
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
