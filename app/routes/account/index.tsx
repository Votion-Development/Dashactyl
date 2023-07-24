import { ActionArgs, json, LoaderArgs, MetaFunction } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import { BsCheckCircle } from 'react-icons/bs';
import { string } from 'zod';
import { formData, text } from 'zod-form-data';
import FormBlock from '~/components/FormBlock';
import FormButton from '~/components/FormButton';
import FormInput from '~/components/FormInput';
import FormLabel from '~/components/FormLabel';
import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';
import {
  syncUser,
  updateUserEmail,
  updateUserName,
  updateUserPassword,
} from '~/models/user.server';
import { requireUser } from '~/session.server';

export const meta: MetaFunction = () => ({
  title: 'Account',
});

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  return json({ user });
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  const data = await request.formData();

  if (data.has('sync')) {
    try {
      void (await syncUser(user.id));
      return json({ success: 'Successfully synced account!', errors: null });
    } catch (err) {
      return json(
        {
          success: null,
          errors: {
            username: null,
            email: null,
            password: null,
            remote: (err as Error).message,
          },
        },
        { status: 400 }
      );
    }
  }

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
          remote: null,
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
            remote: null,
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
            remote: null,
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

function maybeSync(time: string | null): boolean {
  if (!time) return false;
  return new Date(time).getMinutes() <= 5;
}

export default function Account() {
  const { user } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  return (
    <div>
      <NavBar account />
      <SideBar>
        <SideBarRow selected type="link" url="#">
          Account
        </SideBarRow>
        <SideBarRow type="link" url="/account/api">
          API Keys
        </SideBarRow>
        <SideBarRow type="link" url="/account/two-factor">
          Two Factor
        </SideBarRow>
      </SideBar>
      {data?.success && (
        <div
          className="mt-4 flex max-w-lg items-center justify-center rounded-lg bg-green-100 p-2"
          role="alert"
        >
          <div className="flex justify-start text-base font-medium text-green-700">
            <BsCheckCircle className="h-6 w-6" />
            &nbsp;{data.success}
          </div>
        </div>
      )}
      <div className="ml-48 grid-cols-2 lg:grid">
        <div>
          <h1 className="mb-3 ml-4 mt-5 text-2xl font-medium text-white">
            Update Username
          </h1>
          <FormBlock error={data?.errors?.username} method="patch">
            <FormLabel htmlFor="username" text="Username" />
            <FormInput
              defaultValue={user.username}
              id="username"
              name="username"
              type="text"
            />
            <FormButton text="Update Username" type="submit" />
          </FormBlock>
        </div>
        <div>
          <h1 className="mb-3 ml-4 mt-5 text-2xl font-medium text-white">
            Update Email
          </h1>
          <FormBlock error={data?.errors?.email} method="patch">
            <FormLabel htmlFor="email" text="Email" />
            <FormInput
              defaultValue={user.email}
              id="email"
              name="email"
              type="email"
            />
            <FormButton text="Update Email" type="submit" />
          </FormBlock>
        </div>
        <div>
          <h1 className="mb-3 ml-4 mt-5 text-2xl font-medium text-white">
            Update Password
          </h1>
          <FormBlock error={data?.errors?.password} method="patch">
            <FormLabel htmlFor="old_password" text="Old Password" />
            <FormInput id="old_password" name="old_password" type="password" />
            <FormLabel htmlFor="new_password" text="New Password" />
            <FormInput id="new_password" name="new_password" type="password" />
            <FormButton text="Update Password" type="submit" />
          </FormBlock>
        </div>
        <div>
          <h1 className="mb-3 ml-4 mt-5 text-2xl font-medium text-white">
            Sync Status
          </h1>
          <FormBlock error={data?.errors?.remote} method="post">
            <p className="text-md mb-2 text-white">
              {user.lastSyncedAt
                ? `Account last synced at ${user.lastSyncedAt}`
                : 'Account has not been synced to the panel.'}
            </p>
            <FormInput id="sync" name="sync" type="hidden" />
            <FormButton
              disabled={maybeSync(user.lastSyncedAt)}
              text="Sync"
              type="submit"
            />
          </FormBlock>
        </div>
      </div>
    </div>
  );
}
