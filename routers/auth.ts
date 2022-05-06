import { Router } from 'express';
import AccountManager from '../managers/accounts';
// import PanelManager from '../managers/panel';
import Permissions from '../managers/permissions';

const router = Router();

router.post('/login', async (req, res) => {
    let body = <Record<string, string>>req.body;
    if (!body.email || !body.password) return res.redirect(400, '/login?err=MISSINGCREDS');

    const acc = await AccountManager.getByEmail(body.email);
    if (!acc) return res.redirect(404, '/login?err=NOACCOUNT');
    if (!AccountManager.hashMatch(acc, body.password))
        return res.redirect(401, '/login?err=INVALIDPASS');

    return res.redirect('/dashboard');
});

router.post('/signup', async (req, res) => {
    const body = <Record<string, string>>req.body;
    if (!body.username || !body.email || !body.password)
        return res.redirect(400, '/signup?err=MISSINGCREDS');

    let acc = await AccountManager.getByEmail(body.email);
    if (acc) return res.redirect(409, '/signup?err=ACCOUNTEXISTS');
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

    return res.redirect('/dashboard');
});

export default router;
