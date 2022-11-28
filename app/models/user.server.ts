import { createApp } from '@devnote-dev/pterojslite';
import bcrypt from 'bcryptjs';
import { prisma } from '~/db.server';
import { getPanelSettings } from './settings.server';

export type { User } from '@prisma/client';

export function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getRemoteUser(id: string) {
  const [url, key] = await getPanelSettings();

  return createApp(url, key).getUsers(id);
}

export async function getRemoteUserWithServers(id: string) {
  const [url, key] = await getPanelSettings();
  const app = createApp(url, key);
  const user = await app.getUsers(id);
  const servers = await app.getServers();

  // temporary workaround until query filter is supported
  return { user, servers: servers.filter(s => s.user === user.id) };
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
