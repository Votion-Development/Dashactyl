const db = require("../../../lib/database")
const express = require('express');
const router = express.Router();

router.use('/egg', require("./egg/index.js"));
router.use('/location', require("./location/index.js"));
router.use('/package', require("./package/index.js"));

module.exports = router;