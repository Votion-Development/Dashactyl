import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Sidebar from '../Components/Sidebar/Sidebar';
import HeaderStats from '../Components/Headers/HeaderStats';
import FooterAdmin from '../Components/Footers/FooterAdmin';

// views

import Dashboard from '../Pages/Dashboard';
import Afk from '../Pages/Afk';
import CreateServer from '../Pages/CreateServer';
import ManageServer from '../Pages/ManageServer';
import Store from '../Pages/Store';
import Admin from '../Pages/Admin';
import ManageKey from '../Pages/ManageKey';

export default () => (
	<>
		<Sidebar />
		<div className="relative md:ml-64 bg-blueGray-100">
			{/* Header */}
			<HeaderStats />
			<div className="px-4 md:px-10 mx-auto w-full -m-24">
				<Routes>
					<Route path={'/'} element={<Dashboard />} />
					<Route path={'/afk'} element={<Afk />} />
					<Route path={'/create'} element={<CreateServer />} />
					<Route path={'/manage/:id'} element={<ManageServer />} />
					<Route path={'/store'} element={<Store />} />
					<Route path={'/admin'} element={<Admin />} />
					<Route path={'/admin/key/:key'} element={<ManageKey />} />
				</Routes>
				<FooterAdmin />
			</div>
		</div>
	</>
);