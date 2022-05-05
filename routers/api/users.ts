import { FastifyInstance } from 'fastify';
import { Types } from 'mongoose';
import AccountManager from '../../managers/accounts';
import { IAccount } from '../../models/account';
import { Closure } from '..';

export default async function (
    ctx: FastifyInstance,
    done: Closure
): Promise<void> {
    ctx.get('/', async (_, res) => {
        const users = await AccountManager.fetch();
        return res.send({
            status: 'ok',
            data: users.map(transform)
        });
    });

    ctx.get('/:id', async (req, res) => {
        const params = req.params as Record<string, string>;
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
    });

    done();
}

function transform(data: IAccount & { _id: Types.ObjectId }): object {
    return {
        id: data._id.toString(),
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
