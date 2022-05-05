import * as ejs from 'ejs';
import { join } from 'path';
import fastify from 'fastify';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import session from '@fastify/session';
import mongoose from 'mongoose';
import pointOfView from 'point-of-view';
import { MongoDBStore } from 'connect-mongodb-session';
import Logger from './log';
import PanelManager from './managers/panel';
import { BaseSettings, loadBase } from './models/settings';
import validate from './helpers/validator';
import router from './routers';

let settings: BaseSettings;
try {
    settings = loadBase(join(process.cwd(), 'settings.yml'));
} catch {
    process.exit(1);
}

const app = fastify();
const log = new Logger(settings.debug, settings.ensureSave);
const panel = new PanelManager(
    log,
    settings.pterodactyl.url,
    settings.pterodactyl.key
);

const MongoStore = require('connect-mongodb-session')(session);
const store = new MongoStore({
    uri: settings.database.uri,
    collection: 'sessions'
});

app.register(cookie);
app.register(formbody);
app.register(pointOfView, {
    engine:{ ejs },
    root: join(process.cwd(), 'theme')
});
app.register(
    (ctx, _, done) => router(log, panel, settings, ctx, done)
);
app.register(session, {
    secret: settings.secret,
    saveUninitialized: true,
    cookie:{ secure: true },
    store: <MongoDBStore>store
});

(async () => {
    try {
        log.info('validating settings...');
        validate(settings);

        mongoose.connect(settings.database.uri, {
            connectTimeoutMS: 10_000,
            autoIndex: false,
            maxPoolSize: 10,
            family: 4
        });

        mongoose.connection.on('connecting', () => log.info('establishing mongodb connection...'));
        mongoose.connection.on('connected', () => log.info('connected to the database'));
        mongoose.connection.on('error', e => log.error('database error:', e));
        mongoose.connection.on('disconnected', () => log.warn('disconnected from the database'));
    } catch (err) {
        log.withError(err as Error);
        process.exit(1);
    }

    app.listen(settings.port, (err, _) => {
        if (err) {
            log.withError(err);
            process.exit(1);
        }
        log.info(`listening on: http://localhost:${settings.port}`);
    });
})();
