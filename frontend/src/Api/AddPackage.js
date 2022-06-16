export default (event) => {
	event.preventDefault();
	return new Promise((resolve, reject) => {
		fetch('/api/admin/package/add', {
			body: JSON.stringify({
				name: event.target.name.value,
				ram: event.target.ram.value,
				cpu: event.target.cpu.value,
				disk: event.target.disk.value,
				price: event.target.price.value,
				renewal_enabled: event.target.renewal_enabled.value,
				renewal_time: event.target.renewal_time.value,
				renewal_price: event.target.renewal_price.value,
			}),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		}).then(res => resolve(res.json())).catch(reject);
	});
};