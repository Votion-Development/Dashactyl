import { type ActionArgs, json, LoaderArgs, redirect } from '@remix-run/node';
import { Form, Link, useActionData } from '@remix-run/react';
import { RiErrorWarningLine } from 'react-icons/ri';
import { string } from 'zod';
import { checkbox, formData, text } from 'zod-form-data';
import { verifyLogin } from '~/models/user.server';
import { createUserSession, getUser } from '~/session.server';
import { safeRedirect } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  if (user) return redirect('/dashboard');

  return null;
}

export async function action({ request }: ActionArgs) {
  const data = await request.formData();
  const result = formData({
    email: text(string().email('Input must be a valid email.')),
    password: text(string()),
    remember: checkbox(),
  }).safeParse(data);

  if (!result.success) {
    const errors = result.error.formErrors.fieldErrors;

    return json(
      {
        errors: {
          message: null,
          email: errors.email?.[0] || null,
        },
      },
      { status: 400 }
    );
  }

  const user = await verifyLogin(result.data.email, result.data.password);
  if (!user)
    return json(
      {
        errors: {
          message: 'Invalid email or password.',
          email: null,
        },
      },
      { status: 400 }
    );

  return createUserSession({
    redirectTo: safeRedirect(data.get('redirectTo'), '/dashboard'),
    remember: result.data.remember,
    request,
    userId: user.id,
  });
}

export default function Login() {
  const data = useActionData<typeof action>();

  return (
    <main className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-900 to-slate-900">
      <div>
        <div className="p-4 text-center font-sans text-4xl font-bold text-slate-200">
          Dashactyl
        </div>
        <div className="mt-10 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
          {data?.errors.message && (
            <div
              className="mb-2 flex rounded-lg bg-red-500 p-2 font-medium text-white"
              role="alert"
            >
              <RiErrorWarningLine className="h-6 w-6" />
              &nbsp;{data.errors.message}
            </div>
          )}
          <Form method="post">
            <div className="mb-6">
              <label className="mb-2 inline-block text-white" htmlFor="email">
                Email
              </label>
              {data?.errors.email && (
                <div className="mb-1 text-sm text-red-500">
                  {data.errors.email}
                </div>
              )}
              <input
                className="m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
                id="email"
                name="email"
                placeholder="user@example.com"
                type="email"
              />
              <label
                className="form-label mb-2 mt-2 inline-block text-white"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
                id="password"
                name="password"
                type="password"
              />
            </div>
            <div className="mb-6 flex items-center justify-between">
              <div className="form-group form-check">
                <input
                  className="form-check-input float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
                  id="remember"
                  type="checkbox"
                />
                <label
                  className="form-check-label inline-block text-white"
                  htmlFor="remember"
                >
                  Remember me
                </label>
              </div>
              <a
                className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700"
                href="#!"
              >
                Forgot password?
              </a>
            </div>
            <button
              className="w-full rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
              type="submit"
            >
              Login
            </button>
            <p className="mt-6 text-center text-white">
              Not a member?&nbsp;
              <Link
                className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700"
                to="/signup"
              >
                Sign Up
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </main>
  );
}
