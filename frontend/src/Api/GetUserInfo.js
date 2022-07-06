export default (event) => {
	event.preventDefault();
	return new Promise((resolve, reject) => {
		fetch('/api/admin/user/get', {
			body: JSON.stringify({
				email: event.target.email.value,
			}),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		}).then(res => resolve(res.json())).catch(reject);
	});
};