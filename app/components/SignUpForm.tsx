interface SignUpProps {
  callback: () => void;
}

export default function SignUpForm({ callback }: SignUpProps) {
  return (
    <form title="Signup">
      <div className="mb-6">
        <label className="mb-2 inline-block text-white" htmlFor="username">
          Username
        </label>
        <input
          className="m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          id="username"
          type="text"
        />
        <label className="mb-2 mt-2 inline-block text-white" htmlFor="email">
          Email
        </label>
        <input
          className="m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          id="email"
          placeholder="user@example.com"
          type="email"
        />
        <label
          className="form-label mb-2 mt-2 inline-block text-white"
          htmlFor="password"
        >
          Password
        </label>
        <input
          className="m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          id="password"
          type="password"
        />
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div className="form-group form-check">
          <input
            className="form-check-input float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
            id="remember"
            type="checkbox"
          />
          <label
            className="form-check-label inline-block text-white"
            htmlFor="remember"
          >
            Remember me
          </label>
        </div>
      </div>
      <button
        className="w-full rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
        type="submit"
      >
        Sign Up
      </button>
      <p className="mt-6 text-center text-white">
        Already a member?&nbsp;
        <a
          className="text-blue-600 transition duration-200 ease-in-out hover:text-blue-700 focus:text-blue-700"
          onClick={callback}
        >
          Login
        </a>
      </p>
    </form>
  );
}
