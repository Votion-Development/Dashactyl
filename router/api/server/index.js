const db = require('../../../lib/database');
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const webhook = require('../../../lib/webhook');

router.post('/create', async (req, res) => {
	const user = await db.getUser(req.session.account.email);
	const package = await db.getPackage(user.package);
	const available_cpu = package.cpu + user.extra.cpu - user.used_cpu;
	const available_ram = package.ram + user.extra.ram - user.used_ram;
	const available_disk = package.disk + user.extra.disk - user.used_disk;
	if (available_cpu < req.body.cpu || available_ram < req.body.ram || available_disk < req.body.disk) return res.json({ error: 'Not enough resources available.' });

	if (parseInt(req.body.cpu) <= 0 || parseInt(req.body.ram) <= 0 || parseInt(req.body.disk) <= 0) return res.json({ error: 'CPU, RAM and Disk must be greater than 0.' });

	if (Number.isInteger(parseInt(req.body.cpu)) == false || Number.isInteger(parseInt(req.body.ram)) == false || Number.isInteger(parseInt(req.body.disk)) == false) return res.json({ error: 'CPU, RAM and Disk must be integers.' });

	const settings = await db.getSettings();

	const egg = await db.getEgg(req.body.egg);

	const location = await db.getLocation(req.body.location);

	const environment = JSON.parse(egg.environment);

	const serverinfo_req = await fetch(`${settings.pterodactyl_url}/api/application/servers`, {
		method: 'post',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.pterodactyl_key}`
		},
		body: JSON.stringify({
			name: req.body.name,
			user: user.pterodactyl_id,
			egg: egg.id,
			docker_image: egg.docker_image,
			startup: egg.startup,
			environment: environment,
			limits: {
				memory: req.body.ram,
				cpu: req.body.cpu,
				disk: req.body.disk,
				swap: 0,
				io: 500
			},
			feature_limits: {
				databases: parseInt(egg.databases),
				backups: parseInt(egg.backups)
			},
			deploy: {
				locations: [parseFloat(location.id)],
				dedicated_ip: false,
				port_range: []
			}
		})
	});

	const added = await db.addUsed(user.email, req.body.cpu, req.body.ram, req.body.disk);

	if (added != true) return res.json({ error: 'Failed to add used resources. Error: ' + added });

	if (serverinfo_req.statusText !== 'Created') {
		const status = await serverinfo_req.text();
		return res.send({ error: status });
	}

	const serverInfo = await serverinfo_req.json();

	await db.addRenewal(user.email, serverInfo.attributes.id);

	res.send({ success: true });
	webhook.info(`Server Created`, `**User:** ${user.username} (${user.email})\n**Server:** ${serverInfo.attributes.name}\n**CPU:** ${req.body.cpu}\n**RAM:** ${req.body.ram}\n**Disk:** ${req.body.disk}`);
});

router.get('/get/:id', async (req, res) => {
	const user = await db.getUser(req.session.account.email);
	const settings = await db.getSettings();
	const panelinfo_raw = await fetch(`${settings.pterodactyl_url}/api/application/users/${user.pterodactyl_id}?include=servers`, {
		method: 'get',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.pterodactyl_key}`
		}
	});
	if ((await panelinfo_raw.statusText) === 'Not Found') return res.send({ error: 'Pterodactyl user not found' });
	const panelinfo = await panelinfo_raw.json();
	const servers = panelinfo.attributes.relationships.servers.data;
	const server = servers.find((server) => server.attributes.id == req.params.id);
	if (!server) return res.send({ error: 'Server not found' });
	res.send({ server: server });
});

router.delete('/delete/:id', async (req, res) => {
	const user = await db.getUser(req.session.account.email);
	const settings = await db.getSettings();
	const panelinfo_raw = await fetch(`${settings.pterodactyl_url}/api/application/users/${user.pterodactyl_id}?include=servers`, {
		method: 'get',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.pterodactyl_key}`
		}
	});
	if ((await panelinfo_raw.statusText) === 'Not Found') return res.send({ error: 'Pterodactyl user not found' });
	const panelinfo = await panelinfo_raw.json();
	const servers = panelinfo.attributes.relationships.servers.data;
	const server = servers.find((server) => server.attributes.id == req.params.id);
	if (!server) return res.send({ error: 'Server not found' });
	const deletionresults = await fetch(`${settings.pterodactyl_url}/api/application/servers/${req.params.id}`, {
		method: 'delete',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.pterodactyl_key}`
		}
	});
	if (!deletionresults.ok) return res.send({ error: 'Failed to delete server' });
	const newCpu = parseInt(user.used_cpu) - parseInt(server.attributes.limits.cpu);
	const newRam = parseInt(user.used_ram) - parseInt(server.attributes.limits.memory);
	const newDisk = parseInt(user.used_disk) - parseInt(server.attributes.limits.disk);
	await db.removeRenewal(req.params.id);

	await db.setUsed(req.session.account.email, parseInt(newCpu), parseInt(newRam), parseInt(newDisk));
	res.send({ success: true });
	webhook.info(`Server Deleted`, `**User:** ${user.username}\n**Server Name:** ${server.attributes.name}\n**Server ID:** ${req.params.id}`);
});

module.exports = router;
