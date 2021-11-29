/* eslint-disable no-mixed-operators */
module.exports.load = async function (app, ifValidAPI, ejs) {
  app.post('/api/coupons/create_coupon', async (req, res) => {
    if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'create coupon')) {
      if (typeof req.body !== 'object') return res.json({ error: process.api_messages.core.bodymustbeanobject })
      if (Array.isArray(req.body)) return res.json({ error: process.api_messages.core.bodycannotbeanarray })

      let coupon = req.body.coupon
      if (typeof coupon !== 'string') coupon = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      if (coupon.length === 0) coupon = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const coins = req.body.coins
      const memory = req.body.memory
      const disk = req.body.disk
      const cpu = req.body.cpu
      const servers = req.body.servers

      const couponinfo = {
        code: coupon,
        coins: null,
        memory: null,
        disk: null,
        cpu: null,
        servers: null
      }

      if (typeof coins === 'number' || typeof memory === 'number' || typeof disk === 'number' || typeof cpu === 'number' || typeof servers === 'number') { // ok I got lazy. please don't make fun of this sh*t code. - Two
        if (typeof coins === 'number') couponinfo.coins = Math.round(coins) < 1 ? null : (Math.round(coins) > 1073741823 ? 1073741823 : Math.round(coins))
        if (typeof memory === 'number') couponinfo.memory = Math.round(memory) < 1 ? null : (Math.round(memory) > 1073741823 ? 1073741823 : Math.round(memory))
        if (typeof disk === 'number') couponinfo.disk = Math.round(disk) < 1 ? null : (Math.round(disk) > 1073741823 ? 1073741823 : Math.round(disk))
        if (typeof cpu === 'number') couponinfo.cpu = Math.round(cpu) < 1 ? null : (Math.round(cpu) > 1073741823 ? 1073741823 : Math.round(cpu))
        if (typeof servers === 'number') couponinfo.servers = Math.round(servers) < 1 ? null : (Math.round(servers) > 1073741823 ? 1073741823 : Math.round(servers))

        if (couponinfo.coins == null && couponinfo.memory == null && couponinfo.disk == null && couponinfo.cpu == null && couponinfo.servers == null) return res.json({ error: process.api_messages.coupons.nopropervalueshavebeenprovided })

        await process.db.createCoupon(couponinfo.code, couponinfo.coins, couponinfo.memory, couponinfo.disk, couponinfo.cpu, couponinfo.servers)

        return res.json({ error: process.api_messages.core.noError, coupon: couponinfo })
      } else {
        return res.json({ error: process.api_messages.coupons.noresourcevaluesprovided })
      };
    };
  })
}
