import { FastifyInstance } from 'fastify';
import type Logger from '../log';
import AccountManager from '../managers/accounts';
import Permissions from '../managers/permissions';
import { Closure, SessionType } from '.';

export default async function (log: Logger, ctx: FastifyInstance, done: Closure) {
    ctx.addHook('onError', (_, res, err) => {
        log.error(err.message);
        return res.view('errors.ejs', {
            code: 500,
            message: err.message
        });
    });

    ctx.post('/login', {
        schema:{
            body:{
                type: 'object',
                required:['email', 'password'],
                properties:{
                    email:{ type: 'string' },
                    password:{ type: 'string' }
                }
            }
        }
    }, async (req, res) => {
        const body = req.body as Record<string, string>;
        const user = await AccountManager.get(body.email);
        if (!user) return res.redirect('/login?err=NOACCOUNT');
        if (!AccountManager.hashMatch(user, body.password))
            return res.redirect('/login?err=INVALIDPASS');

        req.session.set('account', {
            user,
            servers: [],
            type: SessionType.RETURNING,
            isAdmin: false
        });
        return res.redirect('/dashboard');
    });

    ctx.post('/signup', {
        schema:{
            body:{
                type: 'object',
                required:['username', 'email', 'password'],
                properties:{
                    username:{ type: 'string' },
                    email:{ type: 'string' },
                    password:{ type: 'string' }
                }
            }
        }
    }, async (req, res) => {
        const body = req.body as Record<string, string>;
        let user = await AccountManager.get(body.email);
        if (user) return res.redirect('/signup?err=ACCOUNTEXISTS');
        user = await AccountManager.create({
            username: body.username,
            email: body.email,
            password: body.password,
            avatar: 'https://www.gravatar.com/0',
            package: 'default',
            referral: null,
            permissions: Permissions.getUser(),
            suspended: false,
            createdAt: Date.now(),
            lastLogin: Date.now()
        });

        req.session.set('account', {
            user,
            servers: [],
            type: SessionType.NEW_ACCOUNT,
            isAdmin: false
        });
        return res.redirect('/dashboard');
    });

    done();
}
