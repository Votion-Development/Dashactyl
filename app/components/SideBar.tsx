import { ReactNode } from 'react';

interface SideBarProps {
  children: ReactNode;
}

export default function SideBar({ children }: SideBarProps) {
  return (
    <div className="absolute h-full w-52 bg-slate-900 px-1 shadow-md">
      <ul className="relative mt-4 flex flex-col gap-y-2">{children}</ul>
    </div>
  );
}
