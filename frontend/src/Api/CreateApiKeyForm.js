export default (event) => {
	event.preventDefault();
	return new Promise((resolve, reject) => {
		fetch('/api/admin/keys/add',
			{
				body: JSON.stringify({
					description: event.target.description.value,
				}),
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
			}).then(res => resolve(res.json())).catch(reject);
	});
};