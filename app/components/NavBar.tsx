import { Tooltip } from '@mui/material';
import { Form, Link } from '@remix-run/react';
import { BiUserCircle } from 'react-icons/bi';
import { FiLogOut } from 'react-icons/fi';
import { RxDashboard } from 'react-icons/rx';
// import { Account, hasAny } from '~/models/permissions.server';

export default function NavBar({ account }: { account?: boolean }) {
  return (
    <nav className="flex h-14 w-full flex-row items-center justify-between bg-slate-900 px-4 shadow-lg">
      <Link className="px-9 font-sans text-2xl font-bold text-slate-200" to="/">
        Dashactyl
      </Link>
      <div className="mt-1 mr-1 flex flex-row justify-center gap-x-6 text-white">
        {account ? (
          <Tooltip arrow placement="bottom" title="Dashboard">
            <Link to="/dashboard">
              <RxDashboard className="hover:text-cyan-300" size={32} />
            </Link>
          </Tooltip>
        ) : (
          <Tooltip arrow placement="bottom" title="Account">
            <Link to="/account">
              <BiUserCircle className="hover:text-cyan-300" size={32} />
            </Link>
          </Tooltip>
        )}
        <Tooltip arrow placement="bottom" title="Logout">
          <Form action="/logout" method="post">
            <button type="submit">
              <FiLogOut className="hover:text-cyan-300" size={32} />
            </button>
          </Form>
        </Tooltip>
      </div>
    </nav>
  );
}
