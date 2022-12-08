import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { string } from 'zod';
import { formData, text } from 'zod-form-data';
import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';
import {
  updateUserEmail,
  updateUserName,
  updateUserPassword,
} from '~/models/user.server';
import { requireUser } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  return json({ user });
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  const data = await request.formData();
  const result = formData({
    username: text(string().optional()),
    email: text(string().email('Input must be a valid email.').optional()),
    old_password: text(string().optional()),
    new_password: text(string().optional()),
  }).safeParse(data);

  if (!result.success) {
    const errors = result.error.formErrors.fieldErrors;

    return json(
      {
        success: null,
        errors: {
          username: errors.username?.[0] || null,
          email: errors.email?.[0] || null,
          password: null,
        },
      },
      { status: 400 }
    );
  }

  let success: string | null = null;
  if (result.data.username) {
    void (await updateUserName(user.id, result.data.username));
    success = 'Successfully updated account username!';
  }

  if (result.data.email) {
    try {
      void (await updateUserEmail(user.id, result.data.email));
      success = 'Successfully updated account email!';
    } catch (err) {
      return json(
        {
          success: null,
          errors: {
            username: null,
            email: (err as Error).message,
            password: null,
          },
        },
        { status: 400 }
      );
    }
  }

  if (result.data.new_password) {
    try {
      void (await updateUserPassword(
        user.id,
        result.data.old_password!,
        result.data.new_password
      ));
      success = 'Successfully updated account password!';
    } catch (err) {
      return json(
        {
          success: null,
          errors: {
            username: null,
            email: null,
            password: (err as Error).message,
          },
        },
        { status: 400 }
      );
    }
  }

  return json({
    success,
    errors: null,
  });
}

export default function Account() {
  const { user } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  return (
    <div>
      <NavBar account />
      <SideBar>
        <SideBarRow selected>
          <Link to="#">Account</Link>
        </SideBarRow>
        <SideBarRow>
          <Link to="/account/api">API Keys</Link>
        </SideBarRow>
      </SideBar>
      <div className="lg:grid grid-cols-2 ml-48">
        <div className="mt-10 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
          <Form method="patch">
            <label className="mb-2 inline-block text-white" htmlFor="email">
              Username
            </label>
            <input
              className="mb-4 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              defaultValue={user.username}
              id="username"
              name="username"
              type="text"
            />
            <button
              className="w-full rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
              type="submit"
            >
              Update Username
            </button>
          </Form>
        </div>
        <div className="mt-10 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
          <Form method="patch">
            <label className="mb-2 inline-block text-white" htmlFor="email">
              Email
            </label>
            <input
              className="mb-4 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              defaultValue={user.email}
              id="email"
              name="email"
              type="email"
            />
            <button
              className="w-full rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
              type="submit"
            >
              Update Email
            </button>
          </Form>
        </div>
        <div className="mt-10 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
          <Form method="patch">
            <label className="mb-2 inline-block text-white" htmlFor="email">
              Old Password
            </label>
            <input
              className="mb-2 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              id="old_password"
              name="old_password"
              type="password"
            />
            <label className="mb-2 inline-block text-white" htmlFor="email">
              New Password
            </label>
            <input
              className="mb-4 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              id="new_password"
              name="new_password"
              type="password"
            />
            <button
              className="w-full rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
              type="submit"
            >
              Update Password
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
