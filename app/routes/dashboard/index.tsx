import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getRemoteUserWithServers } from '~/models/user.server';
import { requireUser } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  let remote, servers;

  try {
    let data = await getRemoteUserWithServers(user.id);
    remote = data.user;
    servers = data.servers;
  } catch (err) {
    console.log(err);
  }

  return json({ remote, servers, user });
}

export const meta: MetaFunction = () => ({
  title: 'Dashboard',
});

export default function Dashboard() {
  const { remote, servers, user } = useLoaderData<typeof loader>();

  return (
    <div></div>
  );
}
