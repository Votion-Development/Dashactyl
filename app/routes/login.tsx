import {
  type ActionArgs,
  json,
  LoaderArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node';
import { Link, useActionData } from '@remix-run/react';
import { string } from 'zod';
import { checkbox, formData, text } from 'zod-form-data';
import FormBlock from '~/components/FormBlock';
import FormButton from '~/components/FormButton';
import FormCheckBox from '~/components/FormCheckBox';
import FormInput from '~/components/FormInput';
import FormLabel from '~/components/FormLabel';
import { verifyLogin } from '~/models/user.server';
import { createUserSession, getUser } from '~/session.server';
import { safeRedirect } from '~/utils';

export const meta: MetaFunction = () => ({
  title: 'Login',
});

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
  // TODO: add transitions back at a later date

  return (
    <main className="flex items-center justify-center">
      <div>
        <div className="mt-24 p-4 text-center font-sans text-4xl font-bold text-slate-200">
          Dashactyl
        </div>
        <FormBlock error={data?.errors.message} method="post">
          <FormLabel error={data?.errors.email} htmlFor="email" text="Email" />
          <FormInput id="email" name="email" type="email" />
          <FormLabel htmlFor="password" text="Password" />
          <FormInput id="password" name="password" type="password" />
          <div className="mb-4 flex items-center justify-between">
            <FormCheckBox htmlFor="remember" id="remember" text="Remember me" />
            <Link
              className="justify-end text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700"
              to="#!"
            >
              Forgot password?
            </Link>
          </div>
          <FormButton text="Login" type="submit" />
          <p className="mt-6 text-center text-white">
            Not a member?&nbsp;
            <Link
              className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700"
              to="/signup"
            >
              Sign Up
            </Link>
          </p>
        </FormBlock>
      </div>
    </main>
  );
}
