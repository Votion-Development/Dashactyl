import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import { getRemoteUserWithServers } from '~/models/user.server';
import { requireUser } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  try {
    const data = await getRemoteUserWithServers(user.id);

    return json({
      remote: data.user,
      servers: data.servers,
      user,
    });
  } catch {
    return json({
      remote: null,
      servers: null,
      user,
    });
  }
}

export const meta: MetaFunction = () => ({
  title: 'Dashboard',
});

export default function Dashboard() {
  const { remote, servers, user } = useLoaderData<typeof loader>();

  return (
    <>
      <NavBar />
    </>
  );
}
