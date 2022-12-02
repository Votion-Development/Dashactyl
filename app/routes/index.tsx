import { Form, Link } from '@remix-run/react';
import { useOptionalUser } from '~/utils';

export default function Index() {
  const user = useOptionalUser();

  return (
    <main className="flex items-center justify-center">
      <div>
        <div className="mt-52 p-4 text-center font-sans text-4xl font-bold text-slate-200">
          Dashactyl
        </div>
        <div className="mt-2 mb-6 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
          <div className="mb-4 text-center font-sans text-2xl font-bold text-white">
            Welcome{user && ` Back, ${user.username}`}
          </div>
          <div className="flex flex-col items-center">
            {user ? (
              <>
                <Link
                  className="w-full rounded bg-blue-600 px-6 py-2.5 text-center text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
                  to="/dashboard"
                >
                  Dashboard
                </Link>
                <br />
                <Form action="/logout" className="w-full" method="post">
                  <button
                    className="w-full rounded bg-blue-600 px-6 py-2.5 text-center text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
                    type="submit"
                  >
                    Logout
                  </button>
                </Form>
              </>
            ) : (
              <>
                <Link
                  className="w-full rounded bg-blue-600 px-6 py-2.5 text-center text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
                  to="/login"
                >
                  Login
                </Link>
                <div className="py-3 text-sm font-medium uppercase text-white">
                  or
                </div>
                <Link
                  className="w-full rounded bg-blue-600 px-6 py-2.5 text-center text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
                  to="/signup"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
