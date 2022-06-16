import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthRouter from './Routers/AuthRouter';
import DashboardRouter from './Routers/DashboardRouter';

function App() {
	return (
		<Routes>
			<Route path="/" element={<div>Loading</div>} />
			<Route path="/auth/*" element={<AuthRouter />} />
			<Route path="/dashboard/*" element={<DashboardRouter />} />
		</Routes>
	);
}

export default App;
