const express = require('express');
const router = express.Router();

router.use('*', async (req, res, next) => {
    if (!req.session.account) return res.redirect('/auth/login')
    next()
})

router.use('/api', require("./api/index.js"));

module.exports = router;