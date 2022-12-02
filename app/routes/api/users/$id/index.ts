import { type LoaderArgs, Response } from '@remix-run/node';
import { getUserById } from '~/models/user.server';

export async function loader({ params }: LoaderArgs) {
    const user = await getUserById(params.id!);
    if (!user)
        return new Response(
            JSON.stringify({ error: 'resource not found' }),
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                status: 404,
            }
        );

    const { password: _, ...data } = user;
    return new Response(
        JSON.stringify({ object: 'user', data }),
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    );
}
