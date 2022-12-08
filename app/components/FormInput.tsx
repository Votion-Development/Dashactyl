interface FormInputProps {
  defaultValue?: string;
  id: string;
  name: string;
  type: string;
}

export default function FormInput(data: FormInputProps) {
  return (
    <input
      className="mb-4 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
      {...data}
    />
  );
}
