const db = require('../../../../lib/database');
const express = require('express');
const router = express.Router();
const webhook = require('../../../../lib/webhook');

router.get('/get/all', async (req, res) => {
	const eggs = await db.getEggs();
	res.json(eggs);
});

router.post('/add', async (req, res) => {
	const settings = await db.getSettings();
	if (!settings.pterodactyl_url) return res.json({ error: 'Pterodactyl URL not set' });
	if (!settings.pterodactyl_key) return res.json({ error: 'Pterodactyl Key not set' });
	const egg = await db.getEgg(req.body.name);
	if (egg) return res.send({ error: 'An egg with that name already exists.' });
	await db.addEgg(req.body);
	res.send({ success: true });
	webhook.info(`Egg added`, `**Name:** ${req.body.name}\n**ID:** ${req.body.egg_id}\n**Docker Image:** ${req.body.egg_docker_image}\n**Startup:** ${req.body.egg_startup}\n**Databases:** ${req.body.egg_databases}\n**Backups:** ${req.body.egg_backups}\n**Environment:** ${req.body.egg_environment}`);
});

module.exports = router;
