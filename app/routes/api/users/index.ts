import { type LoaderArgs, Response } from '@remix-run/node';
import { getAllUsers } from '~/models/user.server';

export async function loader(_: LoaderArgs) {
  const data = await getAllUsers();

  return new Response(JSON.stringify({ object: 'users', data }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
