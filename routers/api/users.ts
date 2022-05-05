import { FastifyInstance } from 'fastify';
import { Types } from 'mongoose';
import AccountManager from '../../managers/accounts';
import { IAccount } from '../../models/account';
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
                data: transform(user)
            });
        }
        const users = await AccountManager.fetch();
        return res.send({
            status: 'ok',
            data: users.map(transform)
        });
    });

    done();
}

function transform(data: IAccount & { _id: Types.ObjectId }): object {
    return {
        id: data.id || data._id.toString(),
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        resources: data.resources,
        package: data.package,
        referral: data.referral,
        permissions: data.permissions,
        suspended: data.suspended,
        created_at: data.createdAt,
        last_login: data.lastLogin
    }
}
