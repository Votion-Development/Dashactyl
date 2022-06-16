const db = require('../../../../lib/database');
const express = require('express');
const router = express.Router();

router.get('/get/all', async (req, res) => {
	const locations = await db.getLocations();
	res.json(locations);
});

router.post('/add', async (req, res) => {
	const settings = await db.getSettings();
	if (!settings.pterodactyl_url) return res.json({ error: 'Pterodactyl URL not set' });
	if (!settings.pterodactyl_key) return res.json({ error: 'Pterodactyl Key not set' });
	const location = await db.getLocation(req.body.name);
	if (location) return res.send({ error: 'A location with that name already exists.' });
	await db.addLocation(req.body);
	res.send({ success: true });
});

router.post('/update/status', async (req, res) => {
	const settings = await db.getSettings();
	if (!settings.pterodactyl_url) return res.json({ error: 'Pterodactyl URL not set' });
	if (!settings.pterodactyl_key) return res.json({ error: 'Pterodactyl Key not set' });
	const location = await db.getLocationByID(req.body.location);
	if (!location) return res.send({ error: 'That location does not exist.' });
	await db.updateLocationStatus(req.body);
	res.send({ success: true });
});

module.exports = router;
