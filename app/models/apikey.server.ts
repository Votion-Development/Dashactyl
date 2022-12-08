import { prisma } from '~/db.server';

export type { ApiKey } from '@prisma/client';

export function getUserKeys(userId: string) {
  return prisma.apiKey.findMany({ where: { userId } });
}
