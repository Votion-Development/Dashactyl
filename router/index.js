const log = require("../lib/logger")
const db = require("../lib/database")
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/install', async (req, res) => {
    const obj = JSON.parse(JSON.stringify(req.body));
    const body = JSON.parse(obj.data);
    const settings = await db.getSettings()
    if (settings.pterodactyl_url || settings.pterodactyl_key) return res.json({ "error": "Already installed" })
    await db.setSettings(body)
    res.json({ "success": true })
})

router.get('/getName', async (req, res) => {
    const settings = await db.getSettings()
    res.json({ 'name': settings.name })
})

router.get('/me', async (req, res) => {
    if (!req.session.account) return res.json({ user: req.session.account })
    const user = await db.getUser(req.session.account.email)
    const settings = await db.getSettings()
    if (!settings.pterodactyl_url) return res.json({ "error": "Pterodactyl URL not set" })
    if (!settings.pterodactyl_key) return res.json({ "error": "Pterodactyl Key not set" })
    const panelinfo_raw = await fetch(`${settings.pterodactyl_url}/api/application/users/${user.pterodactyl_id}?include=servers`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${settings.pterodactyl_key}`
        }
    }
    )
    if (await panelinfo_raw.statusText === 'Not Found') return res.json({ "error": "Pterodactyl user not found" })
    const panelinfo = await panelinfo_raw.json()
    const package = await db.getPackage(user.package)
    const stats = {
        "total_ram": package.ram + user.extra.ram,
        "total_disk": package.disk + user.extra.disk,
        "total_cpu": package.cpu + user.extra.cpu,
        "used_ram": user.used_ram,
        "used_cpu": user.used_cpu,
        "used_disk": user.used_disk,
    }
    req.session.account = user
    let session = req.session.account
    session.password = ''
    res.json({ user: session, stats: stats, servers: panelinfo.attributes.relationships.servers.data, ptero_user: panelinfo })
})

router.post('/auth/login', async (req, res) => {
    const body = req.body
    const user = await db.getUser(body.email)
    if (!user) {
        return res.send({ "error": "Email or password not correct." })
    }
    let pass
    try {
        pass = await db.verifyPassword(body.email, body.password)
    } catch {
        return res.send({ "error": "Email or password not correct." })
    }
    if (pass != true) {
        return res.send({ "error": "Email or password not correct." })
    }
    user._id = user._id.toString()
    req.session.account = user
    req.session.save()
    res.send({ success: true })
});

router.post('/auth/register', async (req, res) => {
    const body = req.body
    const created = await db.createUser(body.username, body.email, body.password, "credentials")
    if (created != true) return res.json({ "error": created })
    const settings = await db.getSettings()
    const user = await db.getUser(body.email)
    user._id = user._id.toString()

    const data = await fetch(settings.pterodactyl_url + "/api/application/users", {
        method: "post",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${settings.pterodactyl_key}`
        },
        body: JSON.stringify({
            username: user._id,
            email: user.email,
            first_name: user.username,
            last_name: "(Credentials)",
            password: body.password
        })
    }
    );

    if (data.status === 201) {
        const account = await data.json()
        db.setUserPteroID(user.username, account.attributes.id)
    } else if (data.status === 403) {
        log.error("The API key is invalid or has insufficient permissions.")
        return res.json({ "error": "Failed to create user on panel. Please contact an administrator." })
    }
    req.session.account = user
    req.session.save()
    return res.send({ success: true })
});

router.get('/dashboard-info', async (req, res) => {
    const settings = await db.getSettings()
    if (!settings.pterodactyl_url) return res.json({ "error": "Pterodactyl URL not set" })
    if (!settings.pterodactyl_key) return res.json({ "error": "Pterodactyl Key not set" })
    res.json({ "discord_invite": settings.discord_invite, "pterodactyl_url": settings.pterodactyl_url })
})

router.ws('/afk', async (ws, req) => {
    const settings = await db.getSettings()
    setInterval(async function () {
        await db.addCoins(req.session.account.email, +settings.afk_coins)
        ws.send(settings.afk_coins);
    }, settings.afk_interval * 1000);
});

router.get('/afk', async (req, res) => {
    const settings = await db.getSettings()
    if (!settings.pterodactyl_url) return res.json({ "error": "Pterodactyl URL not set" })
    if (!settings.pterodactyl_key) return res.json({ "error": "Pterodactyl Key not set" })
    res.json({ "afk_coins": settings.afk_coins, "afk_interval": settings.afk_interval })
})

router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

module.exports = router;