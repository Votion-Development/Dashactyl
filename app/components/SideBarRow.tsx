import { ReactNode } from 'react';

interface SideBarRowProps {
  selected?: boolean;
  children: ReactNode;
}

export default function SideBarRow({ children, selected }: SideBarRowProps) {
  return (
    <li
      className={`rounded-md py-1.5 text-center font-medium hover:bg-slate-600 text-white ${
        selected && 'bg-slate-700'
      }`}
    >
      {children}
    </li>
  );
}
