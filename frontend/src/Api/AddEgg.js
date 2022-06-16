export default (event) => {
	event.preventDefault();
	return new Promise((resolve, reject) => {
		fetch('/api/admin/egg/add', {
			body: JSON.stringify({
				name: event.target.name.value,
				egg_id: event.target.egg_id.value,
				egg_docker_image: event.target.egg_docker_image.value,
				egg_startup: event.target.egg_startup.value,
				egg_databases: event.target.egg_databases.value,
				egg_backups: event.target.egg_backups.value,
				egg_environment: event.target.egg_environment.value,
			}),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		}).then(res => resolve(res.json())).catch(reject);
	});
};