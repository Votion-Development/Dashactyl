import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import ArcProgress from 'react-arc-progress';
import NavBar from '~/components/NavBar';
import { getRemoteUserServers } from '~/models/remote.server';
import { requireUser } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const data = await getRemoteUserServers(user.id);

  return json({
    remote: data?.[0] || null,
    servers: data?.[1] || null,
    user,
  });
}

export const meta: MetaFunction = () => ({
  title: 'Dashboard',
});

export default function Dashboard() {
  const { remote, servers, user } = useLoaderData<typeof loader>();
  const sansFont =
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

  return (
    <main>
      <NavBar target={user} />
      <div>
        <div className="flex justify-center">
          <div className="block max-w-sm rounded-lg bg-indigo-900 p-6 shadow-lg">
            <h5 className="mb-2 text-center text-xl font-medium leading-tight text-white">
              Coins
            </h5>
            <ArcProgress
              fillColor={'rgb(16 185 129 / 1)'}
              progress={Math.min(Math.round(user.coins / 100), 1)}
              size={120}
              text={user.coins.toString()}
              textStyle={{
                color: 'white',
                font: sansFont,
                size: '24',
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
