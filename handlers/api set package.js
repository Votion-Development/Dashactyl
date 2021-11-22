/* eslint-disable no-mixed-operators */
/* eslint-disable camelcase */
const suspendCheck = require('./server suspension system.js')

module.exports.load = async function (app, ifValidAPI, ejs) {
  app.post('/api/resources/set_package/:id', async (req, res) => {
    if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'set package')) {
      if (typeof req.body !== 'object') return res.json({ error: process.api_messages.core.bodymustbeanobject })
      if (Array.isArray(req.body)) return res.json({ error: process.api_messages.core.bodycannotbeanarray })

      const user_id = req.params.id // Discord ID.
      const userinfo = await process.db.fetchAccountDiscordID(user_id)
      if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid })

      const pkg = req.body.package
      if (pkg !== null && typeof pkg !== 'string') return res.json({ error: process.api_messages.package.mustbeastringornull })
      if (pkg !== null) if (!process.env.packages.list[pkg]) return res.json({ error: process.api_messages.package.invalidpackage })

      if (!pkg) {
        await process.db.setPackageByDiscordID(user_id, null) // idk if this works
      } else {
        await process.db.setPackageByDiscordID(user_id, pkg)
      }

      res.json({
        error: process.api_messages.core.noError,
        package: pkg,
        user_id: user_id
      })

      suspendCheck(user_id)
    };
  })
}
