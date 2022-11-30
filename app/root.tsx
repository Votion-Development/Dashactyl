import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { getUser } from './session.server';
import stylesheet from './styles/tailwind.css';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesheet }];
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Dashactyl',
  viewport: 'width=device-width,initial-scale=1',
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-screen bg-gradient-to-r from-indigo-900 to-slate-800">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
