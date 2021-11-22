/* eslint-disable no-mixed-operators */
/* eslint-disable camelcase */
const suspendCheck = require('./server suspension system.js')

module.exports.load = async function (app, ifValidAPI, ejs) {
  app.post('/api/resources/set_resources/:id', async (req, res) => {
    if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'set resources')) {
      if (typeof req.body !== 'object') return res.json({ error: process.api_messages.core.bodymustbeanobject })
      if (Array.isArray(req.body)) return res.json({ error: process.api_messages.core.bodycannotbeanarray })

      const user_id = req.params.id // Discord ID.
      const userinfo = await process.db.fetchAccountDiscordID(user_id)
      if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid })

      const resources = {
        memory: req.body.memory,
        disk: req.body.disk,
        cpu: req.body.cpu,
        servers: req.body.servers
      }

      const added_resources = {} // because why not do it the lazy way. - Two

      const resource_check_errors = []
      let test_if_all_null = 0

      for (let [type, amount] of Object.entries(resources)) {
        if (amount == null) {
          test_if_all_null++
        } else if (typeof amount !== 'number') {
          resource_check_errors.push(process.api_messages.resources.mustbeanumber.replace(/{{type}}/g, type))
        } else {
          amount = Math.round(amount)

          // Straight up bad and lazy code: - Two

          if (amount < 0) {
            resource_check_errors.push(process.api_messages.resources.cannotbelessthanzero.replace(/{{type}}/g, type))
          } else if (amount > 1073741823) { // Due to Javascript number limitations.
            resource_check_errors.push(process.api_messages.resources.cannotbeoverabignumber.replace(/{{type}}/g, type))
          } else {
            resources[type] = amount // To save rounding changes.
            added_resources[type] = amount
          };
        };
      };

      if (test_if_all_null === Object.entries(resources).length) return res.json({ error: process.api_messages.resources.nochanges })
      if (resource_check_errors.length !== 0) return res.json({ error: process.api_messages.resources.resourcecheckerrors, errors: resource_check_errors })

      await process.db.setResourcesByDiscordID(user_id, resources.memory, resources.disk, resources.cpu, resources.servers)

      res.json({
        error: process.api_messages.core.noError,
        resources: added_resources,
        user_id: user_id
      })

      suspendCheck(user_id)
    };
  })
}
