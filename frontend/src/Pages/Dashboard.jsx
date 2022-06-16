import React from 'react';

// components

import CardServers from '../Components/Cards/CardServers';
import CardInfo from '../Components/Cards/CardInfo';

export default function Dashboard() {
	return (
		<>
			<div className="flex flex-wrap mt-4">
				<div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
					<CardServers />
				</div>
				<div className="w-full xl:w-4/12 px-4">
					<CardInfo />
				</div>
			</div>
		</>
	);
}
