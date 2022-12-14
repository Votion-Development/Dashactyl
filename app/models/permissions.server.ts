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
  KeysCreate = 1 << 7,
  KeysDelete = 1 << 8,
}

export enum API {
  ServersCreate = 1 << 0,
  ServersUpdate = 1 << 1,
  ServersRenew = 1 << 2,
  ServersDelete = 1 << 3,
}

export function hasAny(user: User, ...perms: (Account | API)[]): boolean {
  return perms.some(p => (user.permissions & p) !== 0);
}

export function hasAll(user: User, ...perms: (Account | API)[]): boolean {
  return perms.every(p => (user.permissions & p) !== 0);
}
