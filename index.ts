import ejs from 'ejs';
import { join } from 'path';
import express from 'express';
import mongoose from 'mongoose';
import Logger from './log';
import { BaseSettings, loadBase } from './models/settings';
import validate from './helpers/validator';
import apiRouter from './routers/api';
import authRouter from './routers/auth';
import generalRouter from './routers/general';

let settings: BaseSettings;
try {
    settings = loadBase(join(process.cwd(), 'settings.yml'));
} catch {
    process.exit(1);
}

const app = express();
const log = new Logger(settings.debug, settings.ensureSave);

app.set('view engine', ejs);

app.use(express.json({
    inflate: true,
    limit: '200kb',
    strict: true
}));
app.use(express.urlencoded());

app.use('/api', apiRouter);
app.use('/auth', authRouter);
app.use('/', generalRouter);

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

    app.listen(
        settings.port,
        () => log.info(`listening on: http://localhost:${settings.port}`)
    );
})();
