interface FormLabelProps {
  error?: string | null;
  htmlFor: string;
  text: string;
}

export default function FormLabel({ error, htmlFor, text }: FormLabelProps) {
  return (
    <label className="mb-2 inline-block text-white" htmlFor={htmlFor}>
      {error && (
        <div className="mb-1 text-sm text-red-500">
          {error}
        </div>
      )}
      {text}
    </label>
  );
}
