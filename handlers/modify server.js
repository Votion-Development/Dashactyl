/* eslint-disable camelcase */
/* eslint-disable no-eval */
const fetch = require('node-fetch')
const nodemailer = require('nodemailer')
const functions = require('../functions.js')
const suspendCheck = require('./server suspension system.js')

module.exports.load = async function (app, ifValidAPI, ejs) {
  app.post('/servers/modify/:id',

    process.rateLimit({
      windowMs: 500,
      max: 1,
      message: 'You have been requesting this endpoint too fast. Please try again.'
    }),

    async (req, res) => {
      const redirects = process.pagesettings.redirectactions.modify_server
      if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin)

      const server_id = req.params.id

      if (req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() === server_id).length !== 1) return functions.doRedirect(req, res, redirects.invalidserver)

      const server = req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() === server_id)[0]

      const eggs = Object.entries(process.env.eggs).filter(egg => server.attributes.egg === egg[1].info.egg)
      if (eggs.length !== 1) return functions.doRedirect(req, res, redirects.missingegg)
      const egg = eggs[0][1]

      const { total, current } = await functions.getUserResource(req)

      if (!req.body.memory && !req.body.disk && !req.body.cpu) return functions.doRedirect(req, res, redirects.missingresources, `?id=${req.params.id}`)
      if (!(await functions.parseNumber(req.body.memory)) || !(await functions.parseNumber(req.body.disk)) || !(await functions.parseNumber(req.body.cpu))) return functions.doRedirect(req, res, redirects.invalidresources, `?id=${req.params.id}`)

      const memory = await functions.parseNumber(req.body.memory) || server.attributes.limits.memory
      const disk = await functions.parseNumber(req.body.disk) || server.attributes.limits.disk
      const cpu = await functions.parseNumber(req.body.cpu) || server.attributes.limits.cpu

      if (!memory || !disk || !cpu) return functions.doRedirect(req, res, redirects.invalidresources, `?id=${req.params.id}`)

      if (
        memory + current.memory - server.attributes.limits.memory > total.memory ||
            disk + current.disk - server.attributes.limits.disk > total.disk ||
            cpu + current.cpu - server.attributes.limits.cpu > total.cpu
      ) return functions.doRedirect(req, res, redirects.resourcesexceedplan, `?id=${req.params.id}`)

      for (const [type, value] of Object.entries(egg.minimum)) {
        if (value && eval(type) < value) { return functions.doRedirect(req, res, redirects.toolittleresources, `?id=${req.params.id}`) }
      }

      for (const [type, value] of Object.entries(egg.maximum)) {
        if (value && eval(type) > value) { return functions.doRedirect(req, res, redirects.toomanyresources, `?id=${req.params.id}`) }
      }

      if (
        memory === server.attributes.limits.memory &&
            disk === server.attributes.limits.disk &&
            cpu === server.attributes.limits.cpu
      ) return functions.doRedirect(req, res, redirects.nochanges, `?id=${req.params.id}`)

      const limits = {
        memory: memory,
        disk: disk,
        cpu: cpu,
        swap: server.attributes.limits.swap,
        io: server.attributes.limits.io
      }

      const serverinfo_req = await fetch(
            `${process.env.pterodactyl.domain}/api/application/servers/${req.params.id}/build`,
            {
              method: 'patch',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}`, Accept: 'application/json' },
              body: JSON.stringify({
                limits: limits,
                feature_limits: server.attributes.feature_limits,
                allocation: server.attributes.allocation
              })
            }
      )

      if (await serverinfo_req.statusText !== 'OK'){
      return functions.doRedirect(req, res, redirects.erroronmodification, `?id=${req.params.id}`)
    } else {
            if(process.env.email_system.enabled == true){ //check if email_system is enabled or no.
      
      var contentHTML = `
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
      <div class="bg-dark">
       <a href="${process.env.email_system.extra.dashboard_url}" style="text-decoration:none"><header class="text-center fs-4 py-3 text-white">
        <img src="${process.env.email_system.extra.dashboard_icon}" width="50" height="50">
        ${process.env.email_system.extra.dashboard_name}
       </header></a>
        </div>
       <div class="ms-0 py-4">
       <h1 class="text-black text-center">Server ${name} Modified!</h1>
       <h4 class="text-center">You are receiving this email because you have modified a server in ${${process.env.email_system.extra.dashboard_name}}.</h4>

       <div class="container text-center my-4">
       <button class="btn btn-primary" onclick="window.location.href = '${process.env.email_system.extra.dashboard_url}/servers'">View more information</button>
       <p>If the button doesnt work <a href="${process.env.email_system.extra.dashboard_url}/servers">Click here</a></p>
         </div>
        </div>
    `; 
      // here is the SMTP configuration 
      async function main() {

        let transporter = nodemailer.createTransport({
          host: `${process.env.email_system.smtp_host}`,
          port: process.env.email_system.smtp_port,
          secure: false, // if your smtp port is 465 you need to enable this.
          auth: {
            user: process.env.email_system.smtp_user, // smtp user
            pass: process.env.email_system.smtp_password, // smtp password
          },
        });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: process.env.email_system.smtp_user, // email will be send from this email 
          to: req.userinfo.email, // User email
          subject: "Server Modified - Dashactyl", // You can change this 
          html: contentHTML, // you can edit the email format in var contentHTML section
        });
      
        console.log("Message sent: %s", info.messageId); // Send a console log with email message id (you can delete this line.)
      }
      
      main().catch(console.error); // this checks for an error
      }

      }
    }
      const serverinfo = await serverinfo_req.json()

      const new_all_server_data = req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() !== server_id)
      new_all_server_data.push(serverinfo)
      req.session.data.panelinfo.relationships.servers.data = new_all_server_data

      functions.doRedirect(req, res, redirects.modifiedserver, `?id=${req.params.id}`)
      suspendCheck(req.session.data.userinfo.id)
    })
}
