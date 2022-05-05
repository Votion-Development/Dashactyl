import { FastifyInstance } from 'fastify';
import type Logger from '../../log';
// import ApiKeyManager from '../../managers/apikeys';
import apiUserHandler from './users';
import { Closure } from '..';

export default async function (
    log: Logger,
    ctx: FastifyInstance,
    done: Closure
): Promise<void> {
    // ctx.addHook('onRequest', async (req, res) => {
    //     const session = req.session.get('account');
    //     if (session?.validated) return;

    //     const auth = req.headers.authorization;
    //     if (!auth) return res.status(401).send({
    //         status: 'error',
    //         data:{
    //             code: 401,
    //             error: 'you are not authorized to access this endpoint'
    //         }
    //     });

    //     const key = await ApiKeyManager.getById(auth);
    //     if (!key) return res.status(401).send({
    //         status: 'error',
    //         data:{
    //             code: 401,
    //             error: 'you are not authorized to access this endpoint'
    //         }
    //     });
    // });

    ctx.setNotFoundHandler((_, res) => {
        return res.status(404).send({
            status: 'error',
            data:{
                code: 404,
                error: 'requested endpoint not found'
            }
        });
    });

    ctx.setErrorHandler((err, _, res) => {
        log.withError(err);
        res.status(err.statusCode || 500).send({
            status: 'error',
            data:{
                code: err.statusCode || 500,
                error: `unknown error: ${err.code}`
            }
        });
    });

    ctx.register(
        (ctx, _, end) => apiUserHandler(ctx, end),
        { prefix: '/users' }
    );

    ctx.get('/', (_, res) => {
        res.send({
            status: 'ok',
            data: null // might return something useful later
        });
    });

    done();
}
