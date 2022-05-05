import { FastifyInstance } from 'fastify';
import type Logger from '../log';
import AccountManager from '../managers/accounts';
import type PanelManager from '../managers/panel';
import { CreateUserFields } from '../managers/panel';
import Permissions from '../managers/permissions';
import { Closure, SessionType } from '.';

export default async function (
    log: Logger,
    panel: PanelManager,
    ctx: FastifyInstance,
    done: Closure
): Promise<void> {
    ctx.addHook('onError', (_, res, err) => {
        log.withError(err);
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
        const acc = await AccountManager.getByEmail(body.email);
        if (!acc) return res.redirect('/login?err=NOACCOUNT');
        if (!AccountManager.hashMatch(acc, body.password))
            return res.redirect('/login?err=INVALIDPASS');

        const user = await panel.fetchUser(acc.email);
        req.session.set('account', {
            user: acc,
            servers: [],
            type: SessionType.RETURNING,
            isAdmin: user.rootAdmin,
            validated: true
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
        let acc = await AccountManager.getByEmail(body.email);
        if (acc) return res.redirect('/signup?err=ACCOUNTEXISTS');
        acc = await AccountManager.create({
            username: body.username,
            email: body.email,
            password: body.password,
            avatar: 'https://www.gravatar.com/0',
            resources: AccountManager.DEFAULT_RESOURCES,
            package: 'default',
            referral: null,
            permissions: Permissions.getUser(),
            suspended: false,
            createdAt: Date.now(),
            lastLogin: Date.now()
        });
        const user = await panel.createUser(body as unknown as CreateUserFields);

        req.session.set('account', {
            user: acc,
            servers: [],
            type: SessionType.NEW_ACCOUNT,
            isAdmin: user.rootAdmin,
            validated: true
        });
        return res.redirect('/dashboard');
    });

    done();
}
