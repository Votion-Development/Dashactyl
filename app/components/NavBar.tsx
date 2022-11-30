import { Link } from '@remix-run/react';

export default function NavBar() {
  return (
    <nav className="flex h-14 w-full flex-row items-center justify-between bg-slate-900 px-4">
      <Link className="p-4 font-sans text-2xl font-bold text-slate-200" to="/">
        Dashactyl
      </Link>
    </nav>
  );
}
