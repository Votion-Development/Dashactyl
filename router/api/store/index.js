const db = require('../../../lib/database');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
	const settings = await db.getSettings();
	if (!settings.pterodactyl_url) return res.json({ error: 'Pterodactyl URL not set' });
	if (!settings.pterodactyl_key) return res.json({ error: 'Pterodactyl Key not set' });
	res.json({ ram_price: settings.ram_price, cpu_price: settings.cpu_price, disk_price: settings.disk_price });
});

router.use('/purchase', require('./purchase/index.js'));

module.exports = router;
