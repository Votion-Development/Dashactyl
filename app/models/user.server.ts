import bcrypt from 'bcryptjs';
import { prisma } from '~/db.server';

export type { User } from '@prisma/client';

export async function getAllUsers() {
  const users = await prisma.user.findMany();
  return users.map(u => {
    const { password: _, ...d } = u;
    return d;
  });
}

export function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  username: string,
  email: string,
  password: string
) {
  return prisma.user.create({
    data: {
      username,
      email,
      password: await bcrypt.hash(password, 10),
    },
  });
}

export function deleteUserByEmail(email: string) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const { password: _, ...data } = user;
  return data;
}
