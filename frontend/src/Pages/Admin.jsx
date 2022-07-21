import React from 'react';

import CardAddEgg from '../Components/Cards/CardAddEgg';
import CardAddLocation from '../Components/Cards/CardAddLocation';
import CardUpdateLocationStatus from '../Components/Cards/CardUpdateLocationStatus';
import CardAddPackage from '../Components/Cards/CardAddPackage';
import CardGetUserInfo from '../Components/Cards/CardGetUserInfo';
import CardApiKeys from '../Components/Cards/CardApiKeys';
import CardCreateApiKey from '../Components/Cards/CardCreateApiKey';

export default function Admin() {
	return (
		<>
			<div className="flex flex-wrap mt-4">
				<CardGetUserInfo />
				<CardApiKeys />
				<CardCreateApiKey />
				<CardAddEgg />
				<CardAddLocation />
				<CardUpdateLocationStatus />
				<CardAddPackage />
			</div>
		</>
	);
}
