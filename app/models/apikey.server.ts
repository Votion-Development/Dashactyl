import { prisma } from '~/db.server';

export type { ApiKey } from '@prisma/client';

export function getUserKeys(userId: string) {
  return prisma.apiKey.findMany({ where: { userId } });
}

export async function createKey(userId: string, permissions: number) {
  let count = await prisma.apiKey.count({ where: { userId } });
  if (count >= 10) throw new Error('Limit of 10 API keys reached');

  return prisma.apiKey.create({
    data: {
      userId,
      permissions,
    },
  });
}

export function deleteKey(id: string) {
  return prisma.apiKey.delete({ where: { id } });
}
