import { ReactNode } from 'react';

interface SideBarRowProps {
  selected?: boolean;
  children: ReactNode;
}

export default function SideBarRow({ children, selected }: SideBarRowProps) {
  return (
    <li
      className={`rounded-md py-1.5 text-center font-medium text-white hover:bg-slate-500 hover:bg-opacity-20 ${
        selected && 'bg-slate-500 bg-opacity-50 hover:bg-opacity-70'
      }`}
    >
      {children}
    </li>
  );
}
