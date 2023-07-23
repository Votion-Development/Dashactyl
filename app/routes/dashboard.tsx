import { json, LoaderArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { BsPlugFill } from 'react-icons/bs';
import NavBar from '~/components/NavBar';
import Progress from '~/components/Progress';
import { getRemoteServers } from '~/models/remote';
import { requireUser } from '~/session.server';

export const meta: MetaFunction = () => ({
  title: 'Dashboard',
});

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const servers = await getRemoteServers(user.id);

  return json({ user, servers });
}

function getColor(status: string | null): string {
  switch (status) {
    case 'suspended':
      return 'text-red-600';
    case 'transferring':
      return 'text-red-400';
    default:
      return 'text-white';
  }
}

export default function Dashboard() {
  const { user, servers } = useLoaderData<typeof loader>();

  return (
    <main>
      <NavBar admin={user.permissions > 0} />
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
      <div className="flex justify-center">
        <div className="mt-6 max-w-xl rounded-md bg-slate-900 p-2 shadow-lg">
          {servers ? (
            servers.length ? (
              <ol className="flex flex-col gap-y-2">
                {servers.map(s => (
                  <li
                    className="flex justify-center rounded-md bg-slate-800 px-64 py-2"
                    key={s.id}
                  >
                    <BsPlugFill className={`h-7 w-7 ${getColor(s.status)}`} />
                    <p className="text-xl text-white">{s.name}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="p-1 text-lg text-white">You have no servers.</div>
            )
          ) : (
            <div className="p-1 text-lg text-white">
              Servers could not be loaded.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
