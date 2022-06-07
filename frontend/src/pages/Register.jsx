import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from '../components/Alert';
import register from '../api/Register';

export default function Register() {
	const [message, setMessage] = useState('');
	const navigate = useNavigate();

	const formregister = (event) => {
		console.log("Called")
		register(event).then(data => {
			if (data.success) return navigate('/dashboard');
			if (data.error) setMessage(data.error);
		});
	}

	return (
		<>
			<div className="container mx-auto px-4 h-full">
				<div className="flex content-center items-center justify-center h-full">
					<div className="w-full lg:w-6/12 px-4">
						<div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
							<div className="rounded-t mb-0 px-6 py-6">
								<div className="text-center mb-3">
									<Alert message={message} />
									<br></br>
									<h6 className="text-blueGray-500 text-sm font-bold">
										Sign up with
									</h6>
								</div>
								<div className="btn-wrapper text-center">
									<button
										className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
										type="button"
									>
										<img
											alt="..."
											className="w-5 mr-1"
											src={require("../assets/img/discord.svg").default}
										/>
										Discord
									</button>
								</div>
								<hr className="mt-6 border-b-1 border-blueGray-300" />
							</div>
							<div className="flex-auto px-4 lg:px-10 py-10 pt-0">
								<div className="text-blueGray-400 text-center mb-3 font-bold">
									<small>Or sign up with credentials</small>
								</div>
								<form onSubmit={formregister}>
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
											Username
										</label>
										<input id="username" type="text" className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" placeholder="Name" />
									</div>
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password" >
											Email
										</label>
										<input id="email" type="email" className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" placeholder="Email" />
									</div>

									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password" >
											Password
										</label>
										<input id="password" type="password" className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" placeholder="Password" />
									</div>
									<div className="text-center mt-6">
										<button className="bg-blueGray-800 text-black active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150">
											Create Account
										</button>
									</div>
								</form>
							</div>
						</div>
						<div className="flex flex-wrap mt-6 relative">
							<div className="w-1/2">
								<Link to="/auth/login" className="text-blueGray-200">
									<small>Already have an account? Login</small>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
