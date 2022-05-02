import { FastifyInstance } from 'fastify';
import type Logger from '../log';
import AccountManager from '../managers/accounts';
import { Closure } from '.';

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

        req.session.account = {
            user,
            servers: [],
            type: 1,
            isAdmin: true
        };
        return res.redirect('/dashboard');
    });

    ctx.post('/signup', async (req, res) => {});

    done();
}
