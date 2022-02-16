const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const functions = require('../functions.js')
const renew_server = require('./renew server.js')
const suspendCheck = require('./server suspension system.js')
const nodemailer = require('nodemailer') // Package to send email with nodejs, dont delete pls
module.exports.load = async function (app, ifValidAPI, ejs) {
  app.post('/servers/delete/:id',

    process.rateLimit({
      windowMs: 500,
      max: 1,
      message: 'You have been requesting this endpoint too fast. Please try again.'
    }),

    async (req, res) => {
      const redirects = process.pagesettings.redirectactions.delete_server
      if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin)

      const server_id = req.params.id

      const deletionresults = await fetch(
            `${process.env.pterodactyl.domain}/api/application/servers/${server_id}`,
            {
              method: 'delete',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.pterodactyl.key}`
              }
            }
      )

      const ok = await deletionresults.ok
      if (!ok) {
        return functions.doRedirect(req, res, redirects.errorondeletion)
      } else {
        if(process.env.auditlogs.enabled === true) { // Check if auditlogs are enabled in settings.yml file
             let params = JSON.stringify({ // Convert this to JSON format
                 embeds: [ // Webhook content
                     {
                         title: `Server Deleted`, // Webhook title
                         description: `**__User:__** ${req.session.data.userinfo.username}#${req.session.data.userinfo.discriminator} (${req.session.data.dbinfo.discord_id})\nServer ID: ${server_id}`, // Webhook description
                     }
                 ]
             })
             fetch(`${process.env.auditlogs.webhook_url}`, { // Send webhook to discord channel
                 method: "POST",
                 headers: {
                     'Content-type': 'application/json',
                 },
                 body: params
             }).catch(e => console.warn("[WEBSITE] There was an error sending to the webhook: " + e));
         }
         }

      renew_server.remove(server_id)

      req.session.data.panelinfo.relationships.servers.data = req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() !== server_id)

      functions.doRedirect(req, res, redirects.deletedserver)

      suspendCheck(req.session.data.userinfo.id)
    })
}
