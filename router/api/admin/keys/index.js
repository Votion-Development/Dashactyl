const db = require('../../../../lib/database');
const express = require('express');
const router = express.Router();
const events = require('../../../../lib/events').eventBus;

router.get('/get/all', async (req, res) => {
    const keys = await db.listApiKeys()
    res.json({ keys: keys })
});

router.get('/get/:key', async (req, res) => {
    const key = await db.getApiKey(req.params.key)
    res.json({ key: key })
});

router.delete('/delete/:key', async (req, res) => {
    await db.deleteApiKey(req.params.key)
    res.json({ success: true })
    const keys = await db.listApiKeys()
    events.emit('apiKeysUpdate', keys)
});

router.post('/add', async (req, res) => {
    const key = await db.createApiKey(req.body.description)
    res.json({ success: true, key: key })
    const keys = await db.listApiKeys()
    events.emit('apiKeysUpdate', keys)
});

router.ws('/', async (ws, req) => {
    events.on('apiKeysUpdate', async function (data) {
        ws.send(JSON.stringify({ keys: data }));
    });

    const loop = setInterval(async function () {
        ws.send("stay alive pretty please thanks");
    }, 1000);

    ws.onclose = async () => {
        clearInterval(loop);
    };
})

module.exports = router;
