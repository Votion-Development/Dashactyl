export default (event) => {
	event.preventDefault();
	return new Promise((resolve, reject) => {
		fetch('/api/server/create',
			{
				body: JSON.stringify({
					name: event.target.name.value,
					egg: event.target.egg.value,
					location: event.target.location.value,
					ram: event.target.ram.value,
					cpu: event.target.cpu.value,
					disk: event.target.disk.value,
				}),
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
			}).then(res => resolve(res.json())).catch(reject);
	});
};