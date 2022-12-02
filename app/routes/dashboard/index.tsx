import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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

  return (
    <>
      <NavBar target={user} />
    </>
  );
}
