const db = require('../../../lib/database');
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/get/:id', async (req, res) => {
	const renewal = await db.getRenewal(req.params.id);
	if (!renewal) return res.send({ error: 'Renewal not found' });
	res.send({ renewal: renewal });
});

router.post('/:id', async (req, res) => {
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
	const package = await db.getPackage(user.package);
	if (user.coins < package.renewal_price) return res.send({ error: 'Not enough coins to renew the server.' });
	const new_time = Date.now() + parseInt(package.renewal_time);
	await db.updateRenewal(server.attributes.id, new_time);
	const new_coins = parseInt(user.coins) - parseInt(package.renewal_price);
	await db.updateCoins(user.email, parseInt(new_coins));
	res.send({ success: true });
});

module.exports = router;
