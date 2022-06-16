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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
		if (renewal.renewal_enabled != false) return;
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

app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, './frontend/dist', 'index.html'));
});

app.listen(webconfig.port, () => {
	log.web(`Server started on port ${webconfig.port}`);
});
