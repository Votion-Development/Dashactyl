const db = require("../../../../lib/database")
const express = require('express');
const router = express.Router();

router.get('/get/all', async (req, res) => {
    const eggs = await db.getEggs()
    res.json(eggs)
})

router.post('/add', async (req, res) => {
    const settings = await db.getSettings()
    if (!settings.pterodactyl_url) return res.json({ "error": "Pterodactyl URL not set" })
    if (!settings.pterodactyl_key) return res.json({ "error": "Pterodactyl Key not set" })
    const egg = await db.getEgg(req.body.name)
    if (egg) return res.send({ "error": "An egg with that name already exists." })
    await db.addEgg(req.body)
    res.send({ "success": true })
})

module.exports = router;