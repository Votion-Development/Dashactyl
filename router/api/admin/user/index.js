const db = require('../../../../lib/database');
const express = require('express');
const router = express.Router();

router.post('/get', async (req, res) => {
    const user = await db.getUser(req.body.email);
    if (!user) return res.json({ error: "That user does not exist." })
    user.password = null
    res.json({ success: true, info: user })
});

module.exports = router;
