import { Link } from '@remix-run/react';
import { redirect } from '@remix-run/node';
import Dropdown from 'react-dropdown';
// import { Account, hasAny } from '~/models/permissions.server';
import type { User } from '~/models/user.server';

export default function NavBar({
  username,
}: Omit<User, 'createdAt' | 'updatedAt' | 'lastSyncedAt'>) {
  const options = ['Account', 'Logout'];

  return (
    <nav className="flex h-14 w-full flex-row items-center justify-between bg-slate-900 px-4 shadow-lg">
      <Link className="p-4 font-sans text-2xl font-bold text-slate-200" to="/">
        Dashactyl
      </Link>
      <div className="flex justify-center">
        <Dropdown
          menuClassName="absolute min-w-max list-none px-5 py-2 bg-slate-900 text-white text-center rounded-b-md"
          onChange={console.log}
          options={options}
          placeholder={username}
          placeholderClassName="px-4 py-2.5 mr-6 text-center text-lg font-medium leading-tight text-white"
        />
      </div>
    </nav>
  );
}
