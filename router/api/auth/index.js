const log = require("../../../lib/logger")
const db = require("../../../lib/database")
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/login', async (req, res) => {
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

router.post('/register', async (req, res) => {
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

module.exports = router;