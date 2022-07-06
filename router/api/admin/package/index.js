const db = require('../../../../lib/database');
const express = require('express');
const router = express.Router();
const webhook = require('../../../../lib/webhook');

router.post('/add', async (req, res) => {
	const settings = await db.getSettings();
	if (!settings.pterodactyl_url) return res.json({ error: 'Pterodactyl URL not set' });
	if (!settings.pterodactyl_key) return res.json({ error: 'Pterodactyl Key not set' });
	const location = await db.getPackage(req.body.name);
	if (location) return res.send({ error: 'A package with that name already exists.' });
	await db.addPackage(req.body);
	res.send({ success: true });
	webhook.info(`Package added`, `**Name:** ${req.body.name}\n**Ram:** ${req.body.ram}\n**Disk:** ${req.body.disk}\n**CPU:** ${req.body.cpu}\n**Price:** ${req.body.price}\n**Renewal Enabled:** ${req.body.renewal_enabled}\n**Renewal Time:** ${req.body.renewal_time}\n**Renewal Price:** ${req.body.renewal_price}\n**Default:** false`);
});

module.exports = router;
