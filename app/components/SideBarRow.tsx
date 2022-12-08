import { Link } from '@remix-run/react';
import { ReactNode } from 'react';

interface SideBarRowProps {
  children: ReactNode;
  selected?: boolean;
  type?: 'href' | 'link';
  url?: string;
}

export default function SideBarRow({
  children,
  selected,
  type,
  url,
}: SideBarRowProps) {
  return (
    <>
      {type && url ? (
        type === 'href' ? (
          <a href={url} type="_blank">
            <li
              className={`rounded-md py-1.5 text-center font-medium text-white hover:bg-slate-500 hover:bg-opacity-20 ${
                selected && 'bg-slate-500 bg-opacity-50 hover:bg-opacity-70'
              }`}
            >
              {children}
            </li>
          </a>
        ) : (
          <Link to={url}>
            <li
              className={`rounded-md py-1.5 text-center font-medium text-white hover:bg-slate-500 hover:bg-opacity-20 ${
                selected && 'bg-slate-500 bg-opacity-50 hover:bg-opacity-70'
              }`}
            >
              {children}
            </li>
          </Link>
        )
      ) : (
        <li
          className={`rounded-md py-1.5 text-center font-medium text-white hover:bg-slate-500 hover:bg-opacity-20 ${
            selected && 'bg-slate-500 bg-opacity-50 hover:bg-opacity-70'
          }`}
        >
          {children}
        </li>
      )}
    </>
  );
}
