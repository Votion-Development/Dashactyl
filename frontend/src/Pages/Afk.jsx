import React from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

// components

import CardAfk from '../Components/Cards/CardAfk';

export default function Afk() {
	const [isConnected, setIsConnected] = React.useState(false);
	const [coins, setCoins] = React.useState(0);
	const [time, setTime] = React.useState(0);

	React.useEffect(() => {
		const webSocketProtocol = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
		const ws = new W3CWebSocket(`${webSocketProtocol}${window.location.host}/api/afk`);

		ws.onopen = function () {
			if (isConnected === true) return ws.close();
			console.log('Connected to websocket');
			setIsConnected(true);
		};
		ws.onclose = function () {
			console.log('Disconnected from websocket (Close Event)');
			setIsConnected(false);
			setCoins(0);
		};
		ws.addEventListener('message', function (event) {
			if (event.data.toString("utf8") === "stay alive pretty please thanks") return
			const data = JSON.parse(event.data)
			if (!data.coins) setTime(time => time + parseInt(data.time))
			if (!data.time) {
				setCoins(coins => coins + parseInt(data.coins));
				console.log('Added Coins');
			}
		});
		return () => {
			console.log('Disconnected from websocket (Page Leave)');
			setIsConnected(false);
			ws.close();
			setCoins(0);
		};
	}, []);

	return (
		<>
			<div className="flex flex-wrap mt-4">
				<CardAfk isConnected={isConnected} coins={coins} time={time} />
			</div>
		</>
	);
}
