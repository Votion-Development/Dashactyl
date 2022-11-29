import { Link } from '@remix-run/react';
import { useOptionalUser } from '~/utils';

export default function Index() {
  const user = useOptionalUser();

  return (
    <main className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-900 to-slate-900">
      <div>
        <div className="p-4 text-center font-sans text-4xl font-bold text-slate-200">
          Dashactyl
        </div>
        <div className="mt-2 mb-6 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
          <div className="mb-4 text-center font-sans text-2xl font-bold text-white">
            Welcome
          </div>
          <div className="flex flex-row items-center justify-center">
            <Link
              className="w-full rounded bg-blue-600 px-6 py-2.5 text-center text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
              to="/login"
            >
              Login
            </Link>
            <div className="px-8 text-sm font-medium uppercase text-white">
              or
            </div>
            <Link
              className="w-full rounded bg-blue-600 px-6 py-2.5 text-center text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
              to="/signup"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
