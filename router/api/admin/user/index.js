const db = require('../../../../lib/database');
const express = require('express');
const router = express.Router();

router.post('/get', async (req, res) => {
    const user = await db.getUser(req.body.email);
    user.password = null
    res.json({ success: true, info: user })
});

module.exports = router;
