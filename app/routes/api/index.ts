import { type LoaderArgs, Response } from '@remix-run/node';

export function loader(_: LoaderArgs) {
    return new Response(
        JSON.stringify({ version: '3.0.0' }),
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    );
}
