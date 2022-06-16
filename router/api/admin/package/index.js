const db = require('../../../../lib/database');
const express = require('express');
const router = express.Router();

router.post('/add', async (req, res) => {
	const settings = await db.getSettings();
	if (!settings.pterodactyl_url) return res.json({ error: 'Pterodactyl URL not set' });
	if (!settings.pterodactyl_key) return res.json({ error: 'Pterodactyl Key not set' });
	const location = await db.getPackage(req.body.name);
	if (location) return res.send({ error: 'A package with that name already exists.' });
	await db.addPackage(req.body);
	res.send({ success: true });
});

module.exports = router;
