/* eslint-disable camelcase */
const functions = require('../functions.js')
const suspendCheck = require('./server suspension system.js')

module.exports.load = async function (app, ifValidAPI, ejs) {
  app.post('/store/buy_resources',

    process.rateLimit({
      windowMs: 1000,
      max: 1,
      message: 'You have been requesting this endpoint too fast. Please try again.'
    }),

    async (req, res) => {
      // when copy and paste from set resources API. - Two

      const redirects = process.pagesettings.redirectactions.buy_resources
      if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin)

      const current = await process.db.fetchAccountDiscordID(req.session.data.userinfo.id)

      const resources = {
        memory: await functions.parseNumber(req.body.memory),
        disk: await functions.parseNumber(req.body.disk),
        cpu: await functions.parseNumber(req.body.cpu),
        servers: await functions.parseNumber(req.body.servers)
      }

      const added_resources = {}

      const resource_check_errors = []
      let how_many_are_enabled = 0
      let test_if_all_zero = 0
      let cost = 0

      const hardcoded_errors = []

      for (let [type, amount] of Object.entries(resources)) {
        if (process.env.store[type].enabled) {
          how_many_are_enabled++

          if (typeof amount === 'object' && amount == null) {
            test_if_all_zero++
          } else if (typeof amount !== 'number') {
            resource_check_errors.push({ type: type, reason: 'not a number or null' })
            hardcoded_errors.push(`The provided ${type} is not a number, nor null.`)
          } else {
            amount = Math.round(amount)

            // Straight up bad and lazy code: - Two

            if (amount < 0) {
              test_if_all_zero++
            } else if (amount + current[type] > 1073741823) { // Due to Javascript number limitations.
              resource_check_errors.push({ type: type, reason: 'number is too big', max: 1073741823 - amount })
              hardcoded_errors.push(`The provided value for ${type} is too big.`)
            } else {
              const check_multiple = amount / process.env.store[type].per

              if (check_multiple !== Math.round(check_multiple)) {
                resource_check_errors.push({ type: type, reason: 'number is not a multiple of x', x: process.env.store[type].per })
                hardcoded_errors.push(`The provided value for ${type} is not a multiple of ${process.env.store[type].per}. (${amount})`)
              } else {
                added_resources[type] = current[type] + amount
                cost += process.env.store[type].cost * check_multiple
              }
            };
          };
        };
      };

      if (!how_many_are_enabled) return functions.doRedirect(req, res, redirects.storeisdisabled)
      if (test_if_all_zero === how_many_are_enabled) return functions.doRedirect(req, res, redirects.allvaluescannotbezero)
      if (resource_check_errors.length !== 0) {
        req.session.variables = {
          resource_check_errors: resource_check_errors,
          hardcoded_resource_check_errors: hardcoded_errors
        }

        return functions.doRedirect(req, res, redirects.resourcecheckerrors)
      };

      if (current.coins < cost) {
        req.session.variables = {
          amount_needed: cost - current.coins
        }

        return functions.doRedirect(req, res, redirects.cannotafford)
      };

      await process.db.setCoinsByDiscordID(req.session.data.userinfo.id, current.coins - cost)

      await process.db.setResourcesByDiscordID(
        req.session.data.userinfo.id,
        added_resources.memory,
        added_resources.disk,
        added_resources.cpu,
        added_resources.servers
      )

      functions.doRedirect(req, res, redirects.boughtresources)

      suspendCheck(req.session.data.userinfo.id)
    })
}
