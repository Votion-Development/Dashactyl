import React from 'react';
import CreateApiKeyForm from '../../Api/CreateApiKeyForm';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'sweetalert2/dist/sweetalert2.min.css';

const MySwal = withReactContent(Swal);

export default function CardGetUserInfo() {
	const createApiKeyForm = (event) => {
		CreateApiKeyForm(event).then(data => {
			if (data.success) return MySwal.fire({
				icon: 'success',
				title: 'API Key Created!',
				html: `API Key: ${data.key}`,
			}).then(() => {
				document.getElementById('createApiKeyForm').reset();
			});
			if (data.error) MySwal.fire({
				icon: 'error',
				title: 'Error',
				text: data.error,
			}).then(() => {
				document.getElementById('createApiKeyForm').reset();
			});
		});
	};
	return (
		<>
			<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
				<div className="rounded-t mb-0 px-4 py-3 border-0">
					<div className="flex flex-wrap items-center">
						<div className="relative w-full px-4 max-w-full flex-grow flex-1">
							<h3 className="font-semibold text-base text-blueGray-700">
								Create API Key
							</h3>
						</div>
					</div>
				</div>
				<div className="rounded-t mb-0 px-4 py-3 border-0">
					<div className="flex flex-wrap items-center">
						<div className="relative w-full px-4 max-w-full flex-grow flex-1">
							<form id="createApiKeyForm" onSubmit={createApiKeyForm}>
								<div className="relative z-0 w-full mb-6 group">
									<input type="text" name="description" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
									<label htmlFor="description" className="peer-focus:font-medium absolute text-sm text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
										Description
									</label>
								</div>
								<button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
									Submit
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
