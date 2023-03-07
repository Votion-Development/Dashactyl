import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUser } from '~/session.server';
import NavBar from '~/components/NavBar';

export async function loader({ request }: LoaderArgs) {
  return json({ user: await requireUser(request) });
}

export default function Admin() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main>
      <NavBar account />
    </main>
  );
}
