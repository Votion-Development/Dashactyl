import bcrypt from 'bcryptjs';
import { prisma } from '~/db.server';
import { getRemoteUserByEmail, updateRemoteUser } from './remote';

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

export function updateUserName(id: string, username: string) {
  return prisma.user.update({ where: { id }, data: { username } });
}

export async function updateUserEmail(id: string, email: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  if (user.email === email) return;

  const other = await prisma.user.findUnique({ where: { email } });
  if (other) throw new Error('This email is already in use.');

  return prisma.user.update({ where: { id }, data: { email } });
}

export async function updateUserPassword(id: string, from: string, to: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  let same = await bcrypt.compare(from, user.password);
  if (!same) throw new Error('Current password is invalid.');

  same = await bcrypt.compare(to, user.password);
  if (same) throw new Error('New password is the same as old password.');

  return prisma.user.update({
    where: { id },
    data: {
      password: await bcrypt.hash(to, 10),
    },
  });
}

export async function syncUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  const remote = await getRemoteUserByEmail(user.email);
  if (!remote) throw new Error('User account not found in panel.');

  if (remote.externalId !== user.id) {
    remote.externalId = user.id;
    void (await updateRemoteUser(remote));
  }

  return await prisma.user.update({
    where: { id },
    data: {
      lastSyncedAt: new Date(),
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
