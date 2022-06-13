const db = require("../../../../lib/database")
const express = require('express');
const router = express.Router();

router.post('/ram/:amount', async (req, res) => {
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

router.post('/cpu/:amount', async (req, res) => {
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

    const updated_cpu = await db.updateExtraCpu(user.email, new_cpu)

    if (updated_cpu != true) return res.json({ "error": "Failed to update users extra ram. Error: " + updated_cpu })

    res.json({ "success": true })
})

router.post('/disk/:amount', async (req, res) => {
    if (parseInt(req.params.amount) <= 0) return res.json({ "error": "The amount has to be over 0." })

    if (Number.isInteger(parseInt(req.params.amount)) == false) return res.json({ "error": "The amount must be a integer." })

    const user = await db.getUser(req.session.account.email)

    if (!user) return res.send({ "error": "User not found." })

    const settings = await db.getSettings()

    const price = req.params.amount * settings.disk_price

    if (user.coins < price) return res.json({ "error": "You do not have enough coins." })

    const new_coins = user.coins - price

    const new_disk = user.extra.disk + req.params.amount

    const updated = await db.updateCoins(user.email, new_coins)

    if (updated != true) return res.json({ "error": "Failed to update users coins. Error: " + updated })

    const updated_disk = await db.updateExtraDisk(user.email, new_disk)

    if (updated_disk != true) return res.json({ "error": "Failed to update users extra ram. Error: " + updated_disk })

    res.json({ "success": true })
})

module.exports = router;