import { useState } from 'react';
import LoginForm from '~/components/LoginForm';
import SignUpForm from '~/components/SignUpForm';
// import { useOptionalUser } from '~/utils';

export default function Index() {
  // const user = useOptionalUser();
  const [signUp, setSignUp] = useState(false);

  return (
    <main className="h-full bg-gradient-to-r from-indigo-900 to-slate-900">
      <div className="p-4 font-sans text-4xl font-bold text-slate-200">
        Dashactyl
      </div>
      <div className="block max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg mt-24">
        {signUp ? (
          <SignUpForm callback={() => setSignUp(false)} />
        ) : (
          <LoginForm callback={() => setSignUp(true)} />
        )}
      </div>
    </main>
  );
}
