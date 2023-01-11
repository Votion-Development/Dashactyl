interface FormCheckBoxProps {
  className?: string;
  htmlFor: string;
  id: string;
  text: string;
}

export default function FormCheckBox({
  className,
  htmlFor,
  id,
  text,
}: FormCheckBoxProps) {
  return (
    <div>
      <input
        className={`${className} float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none`}
        id={id}
        name={id}
        type="checkbox"
      />
      <label className="inline-block text-white" htmlFor={htmlFor}>
        {text}
      </label>
    </div>
  );
}
