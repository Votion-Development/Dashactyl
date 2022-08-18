const log = require('../../../lib/logger');
const db = require('../../../lib/database');
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const webhook = require('../../../lib/webhook');

router.post('/login', async (req, res) => {
	const body = req.body;
	if (!body.email) return res.json({ error: "You didn't provide an email!" })
	if (!body.password) return res.json({ error: "You didn't provide a password!" })
	const userip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
	const user = await db.getUser(body.email);
	if (!user) {
		return res.send({ error: 'Email or password not correct.' });
	}
	let pass;
	try {
		pass = await db.verifyPassword(body.email, body.password);
	} catch {
		return res.send({ error: 'Email or password not correct.' });
	}
	if (pass != true) {
		return res.send({ error: 'Email or password not correct.' });
	}
	user._id = user._id.toString();
	req.session.account = user;
	req.session.save();
	await db.updateLastLoginIp(user.email, userip);
	res.send({ success: true });
	webhook.info(`Login`, `**Username:** ${user.username}\n**Email:** ${user.email}`);
});

router.post('/register', async (req, res) => {
	const body = req.body;
	if (!body.email) return res.json({ error: "You didn't provide an email!" })
	if (!body.password) return res.json({ error: "You didn't provide a password!" })
	if (!body.username) return res.json({ error: "You didn't provide a username!" })
	const userip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
	/** Check if user is using a VPN or Proxy to bypass the IP Check */
	const checkProxy = await db.checkProxy(userip);
	if (checkProxy == true) return res.json({ error: 'Possible fraud attempt, please disable any VPN or proxy services to continue.' });
	/** Check if the user has another account on the same IP */
	const verifybyregistered_ip = await db.checkAltsByRegisteredIp(userip);
	const verifybylastlogin_ip = await db.checkAltsByLastLoginIp(userip);
	if (verifybyregistered_ip == true || verifybylastlogin_ip == true) return res.json({ error: 'You already have another account. Multi-accounts are disallowed!' });
	
	const created = await db.createUser(body.username, body.email, body.password, userip, 'credentials');
	if (created != true) return res.json({ error: created });
	const settings = await db.getSettings();
	const user = await db.getUser(body.email);
	user._id = user._id.toString();

	const data = await fetch(settings.pterodactyl_url + '/api/application/users', {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${settings.pterodactyl_key}`
		},
		body: JSON.stringify({
			username: user._id,
			email: user.email,
			first_name: user.username,
			last_name: '(Credentials)',
			password: body.password
		})
	});

	if (data.status === 201) {
		const account = await data.json();
		db.setUserPteroID(user.username, account.attributes.id);
	} else if (data.status === 403) {
		log.error('The API key is invalid or has insufficient permissions.');
		return res.json({ error: 'Failed to create user on panel. Please contact an administrator.' });
	}
	req.session.account = user;
	req.session.save();
	res.send({ success: true });
	webhook.info(`Registered`, `**Username:** ${user.username}\n**Email:** ${user.email}`);
});

module.exports = router;
