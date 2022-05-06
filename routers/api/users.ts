import { Router } from 'express';
import { Types } from 'mongoose';
import AccountManager from '../../managers/accounts';
import { IAccount } from '../../models/account';

const router = Router();

router.get('/', async (_, res) => {
    const users = await AccountManager.fetch();
    return res.json({
        status: 'ok',
        data: users.map(transform)
    });
});

router.get('/:id', async (req, res) => {
    const user = await AccountManager.getById(req.params.id);
    if (!user) return res.status(404).json({
        status: 'error',
        data:{
            code: 404,
            message: 'user account with that id not found'
        }
    });

    return res.json({
        status: 'ok',
        data: transform(user)
    });
});

router.delete('/:id', async (req, res) => {
    const user = await AccountManager.getById(req.params.id);
    if (!user) return res.status(404).json({
        status: 'error',
        data:{
            code: 404,
            message:' user account with that id not found'
        }
    });

    await AccountManager.delete(user.email);
    return res.status(204).end();
});

export default router;

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
