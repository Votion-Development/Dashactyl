import { Form } from '@remix-run/react';
import { ReactNode } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

interface FormBlockProps {
  children: ReactNode;
  error?: string | null;
  method: 'post' | 'patch' | 'put';
}

export default function FormBlock({ children, error, method }: FormBlockProps) {
  return (
    <Form method={method}>
      <div className="mt-10 block w-96 max-w-sm rounded-lg bg-slate-800 p-6 shadow-lg">
        {error && (
          <div className="mb-2 flex rounded-lg bg-red-500 p-2 font-medium text-white">
            <RiErrorWarningLine className="h-6 w-6" />
            &nbsp;{error}
          </div>
        )}
        {children}
      </div>
    </Form>
  );
}
