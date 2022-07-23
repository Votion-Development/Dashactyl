import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AuthRouter from './Routers/AuthRouter';
import DashboardRouter from './Routers/DashboardRouter';
import NProgress from "nprogress";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "nprogress/nprogress.css";
import "./Assets/css/nprogress.css";

function App() {
	React.useEffect(() => {
		fetch('/api/afk', {
			credentials: 'include'
		})
			.then(response => response.json())
			.then(json => {
				const script = document.createElement("script");

				script.src = `https://arc.io/widget.min.js#${json.arcio_code}`;
				script.async = true;

				document.body.appendChild(script);
			});
	}), [];

	const location = useLocation();

	React.useEffect(() => {
		NProgress.start();
		NProgress.done();
	}, [location.pathname]);

	return (
		<>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
			<Routes>
				<Route path="/" element={<div>Loading</div>} />
				<Route path="/auth/*" element={<AuthRouter />} />
				<Route path="/dashboard/*" element={<DashboardRouter />} />
			</Routes>
		</>
	);
}

export default App;
