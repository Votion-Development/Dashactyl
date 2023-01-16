import { User } from './user.server';

export const Account = {
  // standard
  UsersUpdate: 1 << 0,
  UsersPurchase: 1 << 1,
  UsersGift: 1 << 2,
  UsersRedeem: 1 << 3,
  ServersCreate: 1 << 4,
  ServersUpdate: 1 << 5,
  ServersDelete: 1 << 6,
  KeysCreate: 1 << 7,
  KeysDelete: 1 << 8,
} as const;

export const API = {
  ServersCreate: 1 << 0,
  ServersUpdate: 1 << 1,
  ServersRenew: 1 << 2,
  ServersDelete: 1 << 3,
} as const;

export function hasAny(user: User, ...perms: typeof Account[]): boolean;
export function hasAny(user: User, ...perms: typeof API[]): boolean;
export function hasAny(user: User, ...perms: any[]): boolean {
  return perms.some(p => (user.permissions & p) !== 0);
}

export function hasAll(user: User, ...perms: typeof Account[]): boolean;
export function hasAll(user: User, ...perms: typeof API[]): boolean;
export function hasAll(user: User, ...perms: any[]): boolean {
  return perms.every(p => (user.permissions & p) !== 0);
}

export function parseAccountPerms(data: Record<string, boolean>): number {
  let p = 0;
  Object.entries(data)
    .filter(([key, value]) => key in Account && value)
    .forEach(([key]) => (p |= Account[key as keyof typeof Account]));

  return p;
}

export function parseAPIPerms(data: Record<string, boolean>): number {
  let p = 0;
  Object.entries(data)
    .filter(([key, value]) => key in API && value)
    .forEach(([key]) => (p |= API[key as keyof typeof API]));

  return p;
}
