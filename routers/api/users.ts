import { FastifyInstance } from 'fastify';
import AccountManager from '../../managers/accounts';
import { Closure } from '..';

export default async function (
    ctx: FastifyInstance,
    done: Closure
): Promise<void> {
    ctx.get('/users', {
        schema:{
            params:{
                type: 'object',
                properties:{
                    id:{ type: 'string' }
                }
            }
        }
    }, async (req, res) => {
        const params = req.params as Record<string, string>;
        if (params.id) {
            const user = await AccountManager.get(params.id);
            if (!user) return res.status(404).send({
                status: 'error',
                data:{
                    code: 404,
                    error: 'user account with that id not found'
                }
            });
            return res.send({
                status: 'ok',
                data: user
            });
        }
        const users = await AccountManager.fetch();
        return res.send({
            status: 'ok',
            data: users
        });
    });

    done();
}
