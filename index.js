const path = require('path');
const express = require('express');
const app = express();
require('express-ws')(app);
const cors = require('cors');
const session = require('express-session');
const { loadWebconfig } = require('./lib/functions');
const webconfig = loadWebconfig();
const MongoDBStore = require('connect-mongodb-session')(session);
const log = require('./lib/logger');
require('./lib/database');
const db = require('./lib/database');
const fetch = require('node-fetch');
const webhook = require('./lib/webhook');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.enable('trust proxy');

app.use(
	cors({
		origin: webconfig.dashboard_url,
		credentials: true,
		optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
	})
);

const store = new MongoDBStore({
	uri: webconfig.connection_uri,
	databaseName: webconfig.database,
	collection: 'sessions'
});

store.on('error', function (error) {
	log.error(error);
});

app.use(
	session({
		secret: webconfig.secret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: webconfig.ssl
		},
		store: store
	})
);

const checkRenewals = async function () {
	const renewals = await db.getRenewals();
	const now = Date.now();
	const settings = await db.getSettings();
	renewals.forEach(async (renewal) => {
		if (renewal.renewal_enabled === false) return;
		if (renewal.renew_by < now) {
			await fetch(`${settings.pterodactyl_url}/api/application/servers/${renewal.server_id}/suspend`, {
				method: 'post',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${settings.pterodactyl_key}`
				}
			});
		}
	});
};

setInterval(checkRenewals, 30000);

app.post('/install', async (req, res) => {
	const obj = JSON.parse(JSON.stringify(req.body));
	const body = JSON.parse(obj.data);
	const settings = await db.getSettings();
	if (settings.pterodactyl_url || settings.pterodactyl_key) return res.json({ error: 'Already installed' });
	await db.setSettings(body);
	res.json({ success: true });
});

app.get('/', async (req, res) => {
	if (!req.session.account || !req.session.account.email) return res.redirect('/auth/login');
	res.redirect('/dashboard')
});

app.get('/auth/logout', async (req, res) => {
	req.session.destroy()
	res.redirect('/auth/login')
})

app.get('/auth/discord', async (req, res) => {
	const settings = await db.getSettings()
	if (!settings.application_url) return res.send("Application URL not set in database. Please set now.")
	res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${settings.discord_id}&redirect_uri=${encodeURIComponent(`${settings.application_url}/auth/discord/callback`)}&response_type=code&scope=identify%20email%20guilds%20guilds.join`)
})

app.get('/auth/discord/callback', async (req, res) => {
	if (!req.query.code) return res.send("Discord did not return an authorization code. Cannot continue.")

	const settings = await db.getSettings()
	const oauth2Token = await fetch('https://discord.com/api/oauth2/token', {
		method: 'post',
		body: `client_id=${settings.discord_id}&client_secret=${settings.discord_secret}&grant_type=authorization_code&code=${encodeURIComponent(req.query.code)}&redirect_uri=${encodeURIComponent(`${settings.application_url}/auth/discord/callback`)}`,
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	})

	if (!oauth2Token.ok) return res.send("Discord sent an invalid authorization code. Cannot continue.")
	const tokenInfo = JSON.parse(await oauth2Token.text())
	const scopes = tokenInfo.scope

	if (!scopes.includes('identify') || !scopes.includes('guilds.join') || !scopes.includes('email') || !scopes.includes('guilds')) return functions.doRedirect(req, res, redirects.badscopes)
	const userinfo_raw = await fetch('https://discord.com/api/users/@me', {
		method: 'get',
		headers: {
			Authorization: `Bearer ${tokenInfo.access_token}`
		}
	})

	const userinfo = JSON.parse(await userinfo_raw.text())

	if (!userinfo.verified) return res.send("Discord account is not verified.")

	const guildinfo_raw = await fetch('https://discord.com/api/users/@me/guilds', {
		method: 'get',
		headers: {
			Authorization: `Bearer ${tokenInfo.access_token}`
		}
	})

	const guilds = await guildinfo_raw.json()
	if (!Array.isArray(guilds)) return res.send("An error occured when fetching guilds.")

	userinfo.access_token = tokenInfo.access_token
	userinfo.guilds = guilds

	const check_if_banned = (await fetch(`https://discord.com/api/guilds/${settings.discord_guild}/bans/${userinfo.id}`, {
		method: 'get',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bot ${settings.discord_token}`
		}
	})).status

	if (check_if_banned === 200) {
		return res.send("Cannot register, you are banned from the hosts discord.")
		//todo create blacklist system
	} else if (check_if_banned === 404) {
		await fetch(`https://discord.com/api/guilds/${settings.discord_guild}/members/${userinfo.id}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bot ${settings.discord_token}`
			},
			body: JSON.stringify({
				access_token: tokenInfo.access_token
			})
		}
		)
	} else {
		log.error('[AUTO JOIN SERVER] For some reason, the status code is ' + check_if_banned + ', instead of 200 or 404. You should worry about this.')
	}
	await fetch(`https://discord.com/api/guilds/${settings.discord_guild}/members/${userinfo.id}/roles/${settings.registered_role}`, {
		method: "put",
		headers: {
			'Content-Type': 'application/json',
			"Authorization": `Bot ${settings.discord_token}`
		}
	});

	const userindb = await db.getUser(userinfo.email)

	if (!userindb) {
		const generated_password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

		const created = await db.createUser(userinfo.username, userinfo.email, generated_password);
		if (created != true) return res.json({ error: created });
		const user = await db.getUser(userinfo.email);
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
				last_name: '(Discord)',
				password: generated_password
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
		res.redirect(`/dashboard?generatedpassword=${generated_password}`)
		webhook.info(`Registered`, `**Username:** ${user.username}\n**Email:** ${user.email}`);
	} else {
		req.session.account = userindb;
		req.session.save();
		res.redirect(`/dashboard`)
		webhook.info(`Login`, `**Username:** ${userindb.username}\n**Email:** ${userindb.email}`);
	}
})

app.use('*', async (req, res, next) => {
	const pathname = req._parsedUrl.pathname;
	const settings = await db.getSettings();
	if (!settings.pterodactyl_url || !settings.pterodactyl_key) {
		if (!pathname.includes('/api/')) {
			return res.sendFile('./install.html', { root: path.join(__dirname, './') });
		}
	}
	next();
});

app.use(express.static(path.resolve(__dirname, './frontend/dist')));

app.use(require('./router/index.js'));

app.get('*', async (req, res) => {
	const pathname = req._parsedUrl.pathname;
	if (!pathname.includes('/auth/')) {
		if (!req.session.account || !req.session.account.email) {
			if (req.headers.api) {
				const key = await db.getApiKey()
				if (!key) return res.json({ error: "Invalid API key" })
				await db.setLastUsedApiKey(key.key)
			} else {
				return res.redirect('/auth/login');
			}
		}
		const user = await db.getUser(req.session.account.email);
		if (!user) return res.redirect('/auth/login');
	}
	res.sendFile(path.resolve(__dirname, './frontend/dist', 'index.html'));
});

app.listen(webconfig.port, () => {
	log.web(`Server started on port ${webconfig.port}`);
	webhook.success(`Dashboard`, `Dashactyl has started on port ${webconfig.port}. URL: ${webconfig.dashboard_url}`);
});
