const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const db = require('../lib/database');

router.use('*', async (req, res, next) => {
	const pathname = req._parsedUrl.pathname;
	if (!req.session.account) {
		if (req.headers.api) {
			const key = await db.getApiKey()
			if (!key) return res.json({ error: "Invalid API key" })
			await db.setLastUsedApiKey(key.key)
		} else {
			if (pathname.includes('/auth/')) {
				return next();
			} else {
				return res.redirect('/auth/login');
			}
		}
	}
	if (pathname.startsWith('/dashboard/admin')) {
		const user = await db.getUser(req.session.account.email);
		const settings = await db.getSettings();
		const panelinfo_raw = await fetch(`${settings.pterodactyl_url}/api/application/users/${user.pterodactyl_id}?include=servers`, {
			method: 'get',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${settings.pterodactyl_key}`
			}
		});
		if ((await panelinfo_raw.statusText) === 'Not Found') return res.json({ error: 'Pterodactyl user not found' });
		const panelinfo = await panelinfo_raw.json();
		if (panelinfo.attributes.root_admin != true) return res.redirect('/dashboard');
	}
	next();
});

router.use('/api', require('./api/index.js'));

module.exports = router;
