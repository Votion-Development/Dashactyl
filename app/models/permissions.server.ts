import { User } from './user.server';

export enum Account {
  // standard
  UsersUpdate = 1 << 0,
  UsersPurchase = 1 << 1,
  UsersGift = 1 << 2,
  UsersRedeem = 1 << 3,
  ServersCreate = 1 << 4,
  ServersUpdate = 1 << 5,
  ServersDelete = 1 << 6,
}

export function hasAny(user: User, ...perms: Account[]): boolean {
  return perms.some(p => (user.permissions & p) !== 0);
}

export function hasAll(user: User, ...perms: Account[]): boolean {
  return perms.every(p => (user.permissions & p) !== 0);
}
