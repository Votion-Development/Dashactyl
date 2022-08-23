export default (event) => {
	event.preventDefault();
	return new Promise((resolve, reject) => {
		let isEnabled
		if (event.target.location_enabled.value === "true") {
			isEnabled = true
		} else if (event.target.location_enabled.value === "false") {
			isEnabled = false
		} else {
			isEnabled = false
		}
		fetch('/api/admin/location/add',
			{
				body: JSON.stringify({
					name: event.target.location_name.value,
					location_id: event.target.location_id.value,
					location_enabled: isEnabled,
				}),
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
			}).then(res => resolve(res.json())).catch(reject);
	});
};