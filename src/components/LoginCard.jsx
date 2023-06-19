'use client';

import React from 'react';
import { Card, Button } from 'flowbite-react';
import { FaDiscord } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const LoginCard = () => {
    const router = useRouter()

    return (
        <Card className="w-96">
            <h1 className="text-xl text-center">Dashactyl Login</h1>
            <Button onClick={() => router.push("/auth/login")}>
                <span className="flex flex-row items-center justify-center text-center gap-2">Login with Discord <FaDiscord /></span>
            </Button>
        </Card>
    )
}

export default LoginCard