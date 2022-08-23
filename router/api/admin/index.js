
const express = require('express');
const router = express.Router();
const db = require('../../../lib/database')
const package = require('../../../package.json')
const os = require('os');
const osu = require('node-os-utils')

function format(seconds) {
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor(seconds % (60 * 60) / 60);
    var seconds = Math.floor(seconds % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

router.get('/info', async (req, res) => {
    let usage
    usage = Object.assign({}, process.cpuUsage());
    usage.time = process.uptime() * 1000; // s to ms
    usage.percent = (usage.system + usage.user) / (usage.time * 10);
    const usedRam = process.memoryUsage().heapUsed / 1024 / 1024;
    const dashactylStats = {
        ram: Math.round(usedRam * 100) / 100,
        cpu: usage.percent.toFixed(2),
        uptime: format(process.uptime())
    }
    const cpu = osu.cpu
    const cpus = os.cpus()
    const used = os.totalmem() - os.freemem()
    const systemInfo = {
        cpu_model: cpus[0].model,
        platform: process.platform,
        uptime: format(os.uptime),
        usedRam: formatBytes(used),
        totalRam: formatBytes(os.totalmem()),
        cpuUsage: await cpu.usage()
    }
    res.json({ version: package.version, pid: process.pid, systemInfo: systemInfo, dashactylStats: dashactylStats })
})

router.use('/egg', require('./egg/index.js'));
router.use('/location', require('./location/index.js'));
router.use('/package', require('./package/index.js'));
router.use('/user', require('./user/index.js'));
router.use('/keys', require('./keys/index.js'));

module.exports = router;
