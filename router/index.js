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
    if (!user) return res.json({ user: req.session.account })
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

router.get('/admin/getEggs', async (req, res) => {
    const eggs = await db.getEggs()
    res.json(eggs)
})

router.get('/admin/getLocations', async (req, res) => {
    const locations = await db.getLocations()
    res.json(locations)
})

router.post('/admin/addEgg', async (req, res) => {
    const settings = await db.getSettings()
    if (!settings.pterodactyl_url) return res.json({ "error": "Pterodactyl URL not set" })
    if (!settings.pterodactyl_key) return res.json({ "error": "Pterodactyl Key not set" })
    const egg = await db.getEgg(req.body.name)
    if (egg) return res.send({ "error": "An egg with that name already exists." })
    await db.addEgg(req.body.name, req.body.egg_id, req.body.egg_docker_image, req.body.egg_startup, req.body.egg_databases, req.body.egg_backups, req.body.egg_environment)
    res.send({ "success": true })
})

router.post('/admin/addLocation', async (req, res) => {
    const settings = await db.getSettings()
    if (!settings.pterodactyl_url) return res.json({ "error": "Pterodactyl URL not set" })
    if (!settings.pterodactyl_key) return res.json({ "error": "Pterodactyl Key not set" })
    const location = await db.getLocation(req.body.location_name)
    if (location) return res.send({ "error": "A location with that name already exists." })
    await db.addLocation(req.body.location_id, req.body.location_name, req.body.location_enabled)
    res.send({ "success": true })
})

router.get('/store', async (req, res) => {
    const settings = await db.getSettings()
    if (!settings.pterodactyl_url) return res.json({ "error": "Pterodactyl URL not set" })
    if (!settings.pterodactyl_key) return res.json({ "error": "Pterodactyl Key not set" })
    res.json({ "ram_price": settings.ram_price, "cpu_price": settings.cpu_price, "disk_price": settings.disk_price })
})

router.post('/createServer', async (req, res) => {
    const user = await db.getUser(req.session.account.email)
    const package = await db.getPackage(user.package)
    const available_cpu = package.cpu + user.extra.cpu - user.used_cpu
    const available_ram = package.ram + user.extra.ram - user.used_ram
    const available_disk = package.disk + user.extra.disk - user.used_disk
    if (available_cpu < req.body.cpu || available_ram < req.body.ram || available_disk < req.body.disk) return res.json({ "error": "Not enough resources available." })

    if (parseInt(req.body.cpu) <= 0 || parseInt(req.body.ram) <= 0 || parseInt(req.body.disk) <= 0) return res.json({ "error": "CPU, RAM and Disk must be greater than 0." })

    if (Number.isInteger(parseInt(req.body.cpu)) == false || Number.isInteger(parseInt(req.body.ram)) == false || Number.isInteger(parseInt(req.body.disk)) == false) return res.json({ "error": "CPU, RAM and Disk must be integers." })

    const settings = await db.getSettings()

    const egg = await db.getEgg(req.body.egg)

    const location = await db.getLocation(req.body.location)

    const environment = JSON.parse(egg.environment)

    const serverinfo_req = await fetch(`${settings.pterodactyl_url}/api/application/servers`, {
        method: 'post',
        headers: {
            "Accept": "application/json",
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${settings.pterodactyl_key}`
        },
        body: JSON.stringify({
            "name": req.body.name,
            "user": req.session.account.pterodactyl_id,
            "egg": egg.id,
            "docker_image": egg.docker_image,
            "startup": egg.startup,
            "environment": environment,
            "limits": {
                "memory": req.body.ram,
                "cpu": req.body.cpu,
                "disk": req.body.disk,
                "swap": 0,
                "io": 500,
            },
            "feature_limits": {
                "databases": +egg.databases,
                "backups": +egg.backups
            },
            "deploy": {
                "locations": [parseFloat(location.id)],
                "dedicated_ip": false,
                "port_range": []
            }
        })
    })

    const added = await db.addUsed(req.session.account.email, req.body.cpu, req.body.ram, req.body.disk)

    if (added != true) return res.json({ "error": "Failed to add used resources. Error: " + added })

    if (serverinfo_req.statusText !== 'Created') {
        const status = await serverinfo_req.text()
        console.log(status)
        return res.send({ "error": status })
    }
    return res.send({ "success": true })
})

router.post('/store/purchaseRam/:amount', async (req, res) => {
    if (parseInt(req.params.amount) <= 0) return res.json({ "error": "The amount has to be over 0." })

    if (Number.isInteger(parseInt(req.params.amount)) == false) return res.json({ "error": "The amount must be a integer." })

    const user = await db.getUser(req.session.account.email)

    if (!user) return res.send({ "error": "User not found." })

    const settings = await db.getSettings()

    const price = parseInt(req.params.amount) * parseInt(settings.ram_price)

    if (parseInt(user.coins) < parseInt(price)) return res.json({ "error": "You do not have enough coins." })

    const new_coins = parseInt(user.coins) - parseInt(price)

    const new_ram = parseInt(user.extra.ram) + parseInt(req.params.amount)

    const updated = await db.updateCoins(user.email, parseInt(new_coins))

    if (updated != true) return res.json({ "error": "Failed to update users coins. Error: " + updated })

    const updated_ram = await db.updateExtraRam(user.email, parseInt(new_ram))

    if (updated_ram != true) return res.json({ "error": "Failed to update users extra ram. Error: " + updated_ram })

    res.json({ "success": true })
})

router.post('/store/purchaseCpu/:amount', async (req, res) => {
    if (parseInt(req.params.amount) <= 0) return res.json({ "error": "The amount has to be over 0." })

    if (Number.isInteger(parseInt(req.params.amount)) == false) return res.json({ "error": "The amount must be a integer." })

    const user = await db.getUser(req.session.account.email)

    if (!user) return res.send({ "error": "User not found." })

    const settings = await db.getSettings()

    const price = req.params.amount * settings.cpu_price

    if (user.coins < price) return res.json({ "error": "You do not have enough coins." })

    const new_coins = user.coins - price

    const new_cpu = user.extra.cpu + req.params.amount

    const updated = await db.updateCoins(user.email, new_coins)

    if (updated != true) return res.json({ "error": "Failed to update users coins. Error: " + updated })

    const updated_cpu= await db.updateExtraCpu(user.email, new_cpu)

    if (updated_cpu != true) return res.json({ "error": "Failed to update users extra ram. Error: " + updated_cpu })

    res.json({ "success": true })
})

router.post('/store/purchaseDisk/:amount', async (req, res) => {
    if (parseInt(req.params.amount) <= 0) return res.json({ "error": "The amount has to be over 0." })

    if (Number.isInteger(parseInt(eq.params.amount)) == false) return res.json({ "error": "The amount must be a integer." })

    const user = await db.getUser(req.session.account.email)

    if (!user) return res.send({ "error": "User not found." })

    const settings = await db.getSettings()

    const price = req.params.amount * settings.disk_price

    if (user.coins < price) return res.json({ "error": "You do not have enough coins." })

    const new_coins = user.coins - price

    const new_disk = user.extra.disk + req.params.amount

    const updated = await db.updateCoins(user.email, new_coins)

    if (updated != true) return res.json({ "error": "Failed to update users coins. Error: " + updated })

    const updated_disk = await db.updateExtraRam(user.email, new_disk)

    if (updated_disk != true) return res.json({ "error": "Failed to update users extra ram. Error: " + updated_disk })

    res.json({ "success": true })
})

module.exports = router;