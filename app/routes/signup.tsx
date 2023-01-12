import { type ActionArgs, json, LoaderArgs, MetaFunction, redirect } from '@remix-run/node';
import { Link, useActionData } from '@remix-run/react';
import { string } from 'zod';
import { checkbox, formData, text } from 'zod-form-data';
import FormBlock from '~/components/FormBlock';
import FormButton from '~/components/FormButton';
import FormCheckBox from '~/components/FormCheckBox';
import FormInput from '~/components/FormInput';
import FormLabel from '~/components/FormLabel';
import { createUser } from '~/models/user.server';
import { createUserSession, getUser } from '~/session.server';
import { safeRedirect } from '~/utils';

export const meta: MetaFunction = () => ({
  title: 'Sign Up',
});

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
  // TODO: add transitions back at a later date

  return (
    <main className="flex items-center justify-center">
      <div>
        <div className="mt-20 p-4 text-center font-sans text-4xl font-bold text-slate-200">
          Dashactyl
        </div>
        <FormBlock error={data?.errors.message} method="post">
          <FormLabel
            error={data?.errors.username}
            htmlFor="username"
            text="Username"
          />
          <FormInput id="username" name="username" type="text" />
          <FormLabel error={data?.errors.email} htmlFor="email" text="Email" />
          <FormInput id="email" name="email" type="email" />
          <FormLabel htmlFor="password" text="Password" />
          <FormInput id="password" name="password" type="password" />
          <FormCheckBox
            className="mb-4"
            htmlFor="remember"
            id="remember"
            text="Remember me"
          />
          <FormButton text="Sign Up" type="submit" />
          <p className="mt-6 text-center text-white">
            Already a member?&nbsp;
            <Link
              className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700"
              to="/login"
            >
              Login
            </Link>
          </p>
        </FormBlock>
      </div>
    </main>
  );
}
