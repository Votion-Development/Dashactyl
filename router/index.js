const fs = require("fs")
const path = require("path")
const db = require("../lib/database")
const express = require('express');
const { GridFSBucket } = require("mongodb");
const { getAllWarrantsRaw } = require("../lib/database");
const router = express.Router();

router.get('/me', async (req, res) => {
    if (!req.session.account) return res.json({ user: req.session.account })
    const user = await db.getUser(req.session.account.email)
    req.session.account = user
    let session = req.session.account
    session.password = ''
    res.json({ user: req.session.account })
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
    character._id = character._id.toString()
    req.session.account = user
    req.session.save()
    res.send({ success: true })
});

module.exports = router;