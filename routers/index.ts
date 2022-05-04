import { FastifyInstance } from 'fastify';
import type Logger from '../log';
import type PanelManager from '../managers/panel';
import { BaseSettings } from '../models/settings';
import { IAccount } from '../models/account';
import apiRouter from './api';
import authRouter from './auth';

export type Closure = (err?: Error | undefined) => void;

export interface Context {
    user:       IAccount;
    servers:    unknown[];
    type:       SessionType;
    isAdmin:    boolean;
    validated:  boolean;
}

export enum SessionType {
    NONE,
    RETURNING,
    NEW_ACCOUNT
}

export default async function (
    log: Logger,
    panel: PanelManager,
    settings: BaseSettings,
    ctx: FastifyInstance,
    done: Closure
): Promise<void> {
    ctx.setNotFoundHandler((_, res) => res.view('errors.ejs', {
        code: 404,
        name: 'Not Found',
        message: 'Page Not Found',
        invite: settings.discord.invite
    }));

    ctx.setErrorHandler((err, _, res) => {
        log.withError(err);
        res.view('errors.ejs', {
            code: 500,
            name: err.name,
            message: err.message,
            invite: settings.discord.invite
        });
    });

    ctx.get('/login', (_, res) => { res.view('login.ejs', {}); });
    ctx.get('/signup', (_, res) => { res.view('signup.ejs', {}); });
    ctx.register(
        (api, _, done) => authRouter(log, panel, api, done),
        { prefix: '/auth' }
    );
    ctx.register(
        (api, _, done) => apiRouter(log, api, done),
        { prefix: '/api' }
    );

    ctx.get('/dashboard', (req, res) => {
        // const session = req.session.get('account');
        res.view('dashboard.ejs', {
            user:{
                resources:{
                    memory: 0,
                    disk: 0,
                    cpu: 0,
                    servers: 0
                }
            },
            servers:[],
            settings
        });
        // TODO: investigate save issues
        // if (!session) {
        //     res.redirect('/login');
        // } else {
        //     res.view<Context>('dashboard.ejs', session);
        // }
    });

    ctx.get('/', (_, res) => {
        res.view('home.ejs');
    });

    done();
}
