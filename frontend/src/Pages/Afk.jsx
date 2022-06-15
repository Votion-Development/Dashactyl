import React from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

// components

import CardAfk from "../Components/Cards/CardAfk";

export default function Afk() {
    const [isConnected, setIsConnected] = React.useState(false);
    const [coins, setCoins] = React.useState(0);

    React.useEffect(() => {
        const webSocketProtocol = window.location.protocol == "https:" ? "wss://" : "ws://";
        const ws = new W3CWebSocket(`${webSocketProtocol}${window.location.host}/api/afk`);

        ws.onopen = function (event) {
            if (isConnected === true) return ws.close()
            console.log("Connected to websocket");
            setIsConnected(true)
        };
        ws.onclose = function (event) {
            console.log("Disconnected from websocket (Close Event)");
            setIsConnected(false)
            setCoins(0)
        };
        ws.addEventListener('message', function (event) {
            setCoins(coins => coins + +event.data);
            console.log("Added Coins")
        });
        return () => {
            console.log("Disconnected from websocket (Page Leave)");
            setIsConnected(false)
            ws.close()
            setCoins(0)
        };
    }, []);

    return (
        <>
            <div className="flex flex-wrap mt-4">
                <CardAfk isConnected={isConnected} coins={coins} />
            </div>
        </>
    );
}
