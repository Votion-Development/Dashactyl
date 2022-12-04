import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import Progress from '~/components/Progress';
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

  return (
    <main>
      <NavBar target={user} />
      <div>
        <div className="flex justify-center">
          <Progress
            title="Memory"
            text={user.coins}
            progress={Math.min(user.memory / 1e4, 1)}
            color="239 68 68"
          />
          <Progress
            title="Disk"
            text={user.disk}
            progress={Math.min(user.disk / 5000, 1)}
            color="16 185 129"
          />
          <Progress
            title="CPU"
            text={user.cpu}
            progress={Math.min(user.cpu / 1000, 1)}
            color="34 211 238"
          />
          <Progress
            title="Servers"
            text={user.servers}
            progress={Math.min(user.servers / 10, 1)}
            color="139 92 246"
          />
        </div>
      </div>
    </main>
  );
}
