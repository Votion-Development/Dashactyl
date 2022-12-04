import { Link } from '@remix-run/react';
import type { User } from '~/models/user.server';

interface NavBarProps {
  target: Omit<User, 'createdAt' | 'updatedAt' | 'lastSyncedAt'>;
}

export default function NavBar({ target }: NavBarProps) {
  return (
    <nav className="flex h-14 w-full flex-row items-center justify-between bg-slate-900 px-4">
      <Link className="p-4 font-sans text-2xl font-bold text-slate-200" to="/">
        Dashactyl
      </Link>
      <div className="flex justify-center">
        <button
          className="px-6 py-2.5 text-center text-lg font-medium leading-tight text-white shadow-md transition ease-in-out hover:shadow-lg"
          type="button"
        >
          {target.username}
        </button>
        <ul className="absolute z-50 float-left mt-1 hidden min-w-max list-none bg-black py-2 text-base">
          <li className="block w-full bg-transparent px-4 py-2 font-normal">
            <Link to="/account">Account</Link>
          </li>
          {(target.permissions & 8) !== 0 && (
            <li className="block w-full bg-transparent px-4 py-2 font-normal">
              <Link to="/admin">Admin</Link>
            </li>
          )}
          <li className="block w-full bg-transparent px-4 py-2 font-normal">
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
