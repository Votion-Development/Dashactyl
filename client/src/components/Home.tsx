export default function Home(): JSX.Element {
  document.title = 'Home | Dashactyl';

  return (
    <div className="h-full bg-slate-800">
      <nav className="w-full h-12 px-4 flex flex-row items-center justify-between bg-slate-900">
        <a href="/">Dashactyl</a>
      </nav>
    </div>
  );
}
