export default (event) => {
	event.preventDefault();
	return new Promise((resolve, reject) => {
		let isEnabled
		if (event.target.status.value === "true") {
			isEnabled = true
		} else if (event.target.status.value === "false") {
			isEnabled = false
		} else {
			isEnabled = false
		}
		fetch('/api/admin/location/update/status',
			{
				body: JSON.stringify({
					location: event.target.location.value,
					status: isEnabled,
				}),
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
			}).then(res => resolve(res.json())).catch(reject);
	});
};