import { type ActionArgs, json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { useState } from 'react';
import { string } from 'zod';
import { checkbox, formData, text } from 'zod-form-data';
import LoginForm from '~/components/LoginForm';
import SignUpForm from '~/components/SignUpForm';
import { createUser, User, verifyLogin } from '~/models/user.server';
import { createUserSession } from '~/session.server';
import { safeRedirect /*, useOptionalUser */ } from '~/utils';

export async function action({ request }: ActionArgs) {
  const data = await request.formData();
  const redirectTo = safeRedirect(data.get('redirectTo'), '/dashboard');
  const result = formData({
    isLogin: checkbox(),
    username: text(data.get('isLogin') === 'false' ? string().optional() : string()),
    email: text(string().email('Input must be a valid email.')),
    password: text(string()),
  }).safeParse(data);

  if (!result.success) {
    const errors = result.error.formErrors.fieldErrors;

    return json(
      {
        errors: {
          message: null,
          username: errors.username?.[0] || null,
          email: errors.email?.[0] || null,
        }
      },
      { status: 400 }
    );
  }

  let user: Omit<User, 'password'> | null;
  const { isLogin, username, email, password } = result.data;

  if (isLogin) {
    user = await verifyLogin(email, password);
    if (!user) return json({
      errors: {
        message: 'Invalid email or password.',
        username: null,
        email: null,
      }
    });
  } else {
    try {
      user = await createUser(username!, email, password);
    } catch (err) {
      let message = (err as Error).message;
      if (!message) {
        console.error(err);
        message = 'An unknown error occured.';
      }

      return json({
        errors: {
          message,
          username: null,
          email: null,
        }
      });
    }
  }

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user!.id,
  });
}

export default function Index() {
  // const user = useOptionalUser();
  const [signUp, setSignUp] = useState(false);
  const data = useActionData<typeof action>();

  return (
    <main className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-900 to-slate-900">
      <div>
        <div className="p-4 text-center font-sans text-4xl font-bold text-slate-200">
          Dashactyl
        </div>
        <div className="mt-10 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
          {signUp ? (
            <SignUpForm
              callback={() => setSignUp(false)}
              errEmail={data?.errors.email}
              errMessage={data?.errors.message}
              errUsername={data?.errors.username}
            />
          ) : (
            <LoginForm
              callback={() => setSignUp(true)}
              errEmail={data?.errors.email}
              errMessage={data?.errors.message}
            />
          )}
        </div>
      </div>
    </main>
  );
}
