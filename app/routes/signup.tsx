import { type ActionArgs, json, LoaderArgs, redirect } from '@remix-run/node';
import { Form, Link, useActionData } from '@remix-run/react';
import { string } from 'zod';
import { checkbox, formData, text } from 'zod-form-data';
import { createUser } from '~/models/user.server';
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
    username: text(
      string()
        .min(3, 'Username must be longer than 3 characters.')
        .max(32, 'Username must be shorter than 32 characters.')
    ),
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
          username: errors.username?.[0] || null,
          email: errors.email?.[0] || null,
        },
      },
      { status: 400 }
    );
  }

  const { username, email, password } = result.data;
  try {
    const user = await createUser(username, email, password);

    return createUserSession({
      redirectTo: safeRedirect(data.get('redirectTo'), '/dashboard'),
      remember: result.data.remember,
      request,
      userId: user.id,
    });
  } catch (err) {
    const message = (err as Error).message || 'An unknown error occured';

    return json(
      {
        errors: {
          message,
          username: null,
          email: null,
        },
      },
      { status: 400 }
    );
  }
}

export default function SignUp() {
  const data = useActionData<typeof action>();

  return (
    <main className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-900 to-slate-900">
      <div>
        <div className="p-4 text-center font-sans text-4xl font-bold text-slate-200">
          Dashactyl
        </div>
        <div className="mt-10 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
          <Form method="post">
            <div className="mb-6">
              <label
                className="mb-2 inline-block text-white"
                htmlFor="username"
              >
                Username
              </label>
              {data?.errors.username && (
                <div className="mb-1 text-sm text-red-500">
                  {data.errors.username}
                </div>
              )}
              <input
                className="m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
                id="username"
                type="text"
              />
              <label
                className="mb-2 mt-2 inline-block text-white"
                htmlFor="email"
              >
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
            </div>
            <button
              className="w-full rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
              type="submit"
            >
              Sign Up
            </button>
            <p className="mt-6 text-center text-white">
              Already a member?&nbsp;
              <Link
                className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700"
                to="/login"
              >
                Login
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </main>
  );
}
