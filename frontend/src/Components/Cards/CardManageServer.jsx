import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'sweetalert2/dist/sweetalert2.min.css';

const MySwal = withReactContent(Swal);

import { toast } from 'react-toastify'

export default function CardManageServer() {
	const [isLoading, setIsLoading] = React.useState(true);
	const [server, setServer] = React.useState(String);
	const [pterodactylUrl, setPterodactylUrl] = React.useState(String);
	const [renewal, setRenewal] = React.useState(String);
	const [renewalCost, setRenewalCost] = React.useState(String);
	const [renewalEnabled, setRenewalEnabled] = React.useState(String);

	const params = useParams();
	const navigate = useNavigate();

	React.useEffect(() => {
		fetch(`/api/server/get/${params.id}`, {
			credentials: 'include'
		})
			.then(response => response.json())
			.then(json => {
				if (json.error) return MySwal.fire({
					icon: 'error',
					title: 'Error',
					text: json.error,
				}).then(() => {
					navigate('/dashboard');
				});
				setServer(json.server);
				fetch('/api/dashboard-info', {
					credentials: 'include'
				})
					.then(response => response.json())
					.then(json => {
						if (json.error) return MySwal.fire({
							icon: 'error',
							title: 'Error',
							text: json.error,
						});
						setPterodactylUrl(json.pterodactyl_url);
						fetch(`/api/renew/get/${params.id}`, {
							credentials: 'include'
						})
							.then(response => response.json())
							.then(json => {
								if (json.error) return MySwal.fire({
									icon: 'error',
									title: 'Error',
									text: json.error,
								});
								const timestamp = new Date(json.renewal.renew_by);
								const date = new Intl.DateTimeFormat('en-UK', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp);
								setRenewal(date);
								setRenewalCost(json.renewal.renew_cost);
								setRenewalEnabled(json.renewal.renewal_enabled);
								setIsLoading(false);
							});
					});
			});
	}, []);

	const redirect = () => {
		window.open(`${pterodactylUrl}/server/${server.attributes.identifier}`);
	};

	const renewServer = () => {
		MySwal.fire({
			title: 'Are you sure you want to do this?',
			text: `This will cost you ${renewalCost} coins.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes'
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/renew/${params.id}`, {
					method: 'post',
					credentials: 'include'
				})
					.then(response => response.json())
					.then(json => {
						if (json.error) return MySwal.fire({
							icon: 'error',
							title: 'Error',
							text: json.error,
						});
						if (json.success) {
							fetch(`/api/renew/get/${params.id}`, {
								credentials: 'include'
							})
								.then(response => response.json())
								.then(json => {
									if (json.error) return MySwal.fire({
										icon: 'error',
										title: 'Error',
										text: json.error,
									});
									const timestamp = new Date(json.renewal.renew_by);
									const date = new Intl.DateTimeFormat('en-UK', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp);
									setRenewal(date);
									setRenewalCost(json.renewal.renew_cost);
									setRenewalEnabled(json.renewal.renewal_enabled);
								});
							return MySwal.fire({
								icon: 'success',
								title: 'Success!',
								text: 'The server has been renewed!',
							});
						}
					});
			}
		});
	};

	const deleteServer = () => {
		MySwal.fire({
			title: 'Are you sure you want to do this?',
			text: `You will not be able to undo this action!`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes'
		}).then((result) => {
			if (result.isConfirmed) {
				const deleteServerPromise = new Promise(async (resolve, reject) => {
					fetch(`/api/server/delete/${params.id}`, {
						method: 'delete',
						credentials: 'include'
					})
						.then(response => response.json())
						.then(json => {
							if (json.error) {
								reject(json.error)
								return MySwal.fire({
									icon: 'error',
									title: 'Error',
									text: json.error,
								});
							}
							if (json.success) {
								resolve()
								return MySwal.fire({
									icon: 'success',
									title: 'Success!',
									text: 'The server has been deleted!',
								}).then(() => {
									return navigate('/dashboard');
								});
							}
						});
				})
				toast.promise(
					deleteServerPromise,
					{
						pending: 'Deleting server...',
						success: 'The server has been deleted!',
						error: {
							render({ data }) {
								return <a>{data}</a>
							}
						}
					}
				)
			}
		});
	};

	return (
		<>
			<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
				<div className="rounded-t mb-0 px-4 py-3 border-0">
					<div className="flex flex-wrap items-center">
						<div className="relative w-full px-4 max-w-full flex-grow flex-1">
							<h3 className="font-semibold text-base text-blueGray-700">
								Server Info
							</h3>
						</div>
					</div>
				</div>
				<div className="rounded-t mb-0 px-4 py-3 border-0">
					<div className="flex flex-wrap items-center">
						<div className="relative w-full px-4 max-w-full flex-grow flex-1">
							{isLoading ?
								<th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
									<div id="loading-button">
										<svg role="status" className="w-4 mr-3 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
											<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
										</svg>
									</div>
								</th>
								:
								<>
									<a>Server Name: {server.attributes.name}</a>
									<br></br>
									<br></br>
									<a>Ram: {server.attributes.limits.memory}MB</a><br></br>
									<a>CPU: {server.attributes.limits.cpu}%</a><br></br>
									<a>Disk: {server.attributes.limits.disk}MB</a><br></br>
									<br></br>
									{renewalEnabled
										?
										<>
											<a>Renew by: {renewal}</a><br></br>
											<a>Renewal Cost: {renewalCost}</a>
										</>
										:
										<></>
									}
									<br></br>
									<button onClick={redirect} type="button" className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800">View</button>
									{renewalEnabled
										?
										<button onClick={renewServer} type="button" className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Renew Server</button>
										:
										<></>
									}
									<button onClick={deleteServer} type="button" className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">Delete Server</button>
								</>
							}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
