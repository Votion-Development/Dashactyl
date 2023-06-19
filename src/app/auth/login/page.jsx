import React from 'react';
import * as db from '../../../lib/database';

import LoadingSpinner from '@/components/LoadingSpinner';

const RedirectPage = async () => {
    const settings = await db.settings.get()
    console.log(settings)
    const url = `https://discord.com/api/oauth2/authorize?client_id=${settings.discord.client_id}&redirect_uri=${encodeURIComponent(`${settings.application_url}/api/callback`)}&response_type=code&scope=identify%20email%20guilds%20guilds.join`
    return (
        <>
            <meta http-equiv="refresh" content={`0; url=${url}`} />
            <div className="flex flex-col items-center justify-center gap-2 h-screen">
                <LoadingSpinner />
                <p>Redirecting...</p>
            </div>
        </>
    )
}

export default RedirectPage