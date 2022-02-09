const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const nodemailer = require('nodemailer') // Package to send email with nodejs, dont delete pls :)
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
      if(process.env.auditlogs.enabled === true) { // Check if auditlogs is enabled in settings.yml file
        let params = JSON.stringify({ // Convert this to JSON format
          embeds: [ // Webhook content
                   {
                       title: `Server Modified - ${server.attributes.name}`, //Webhook title
                       description: `**__User:__** ${req.session.data.userinfo.username}#${req.session.data.userinfo.discriminator} (${req.session.data.dbinfo.discord_id})\n\n**__Old Configuration:__**\n${server.attributes.limits.memory}MB Ram\n${server.attributes.limits.disk}MB Disk\n${server.attributes.limits.cpu}% CPU\n**__New Configuration:__**\n${memory}MB Ram\n${disk}MB Disk\n${cpu}% CPU`, // Webhook description
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
      if(process.env.email_system.enabled == true){ //check if email_system is enabled or no.
       
       var contentHTML = `
       <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
       <div class="bg-dark">
        <a href="${process.env.email_system.extra.dashboardurl}" style="text-decoration:none"><header class="text-center fs-4 py-3 text-white">
         <img src="https://docs.votion.dev/img/logo.png" alt="" width="50" height="50" style="height:50px;width:50px;">
         ${process.env.email_system.extra.dashboardname}
        </header></a>
         </div>
        <div class="ms-0 py-4">
        <h1 class="text-black text-center">Server ${server.attributes.name} Modified!</h1>
        <h4 class="text-center">You are receiving this email because you have modified a server in ${process.env.email_system.extra.dashboardname} with the following specifications:</h4>
        <center><div class="card text-center justify-content-center" style="width:260px">
        <ul class="list-unstyled">
          <li>OLD RAM: ${server.attributes.limits.memory} MB | NEW RAM: ${memory} MB</li>
          <li>OLD DISK: ${server.attributes.limits.disk} MB | NEW DISK: ${disk} MB</li>
          <li>OLD CPU: ${server.attributes.limits.cpu} % | NEW CPU: ${cpu} %</li>
        </ul>
        </div></center>
        <div class="container text-center my-4">
        <button class="btn btn-primary" onclick="window.location.href = '${process.env.email_system.extra.dashboardurl}'">View more information</button>
        <p>If the button doesnt work <a href="${process.env.email_system.extra.dashboardurl}">Click here</a></p>
          </div>
         </div>
     `; // HTML Structure, you can change and add styles with style="" tag.

       // here is the SMTP configuration 
    let transporter = nodemailer.createTransport({
         host: `${process.env.email_system.smtp_host}`, // The smtp host configured on settings.yml file (dont touch)
         port: process.env.email_system.smtp_port, // The smtp port configured on settings.yml file (dont touch)
         secure: true, // If your smtp host uses ssl or uses 465 port put in true, else put on false
         auth: {
             user: `${process.env.email_system.smtp_user}`, // The smtp user configured on settings.yml file (dont touch)
             pass: `${process.env.email_system.smtp_password}` // The smtp password configured on settings.yml file (dont touch)
         },
         tls: {
             rejectUnauthorized: false // dont touch this.
         }
     });

     let info = await transporter.sendMail({
         from: `"Server Modified" <${process.env.email_system.smtp_user}>`, // You can edit the content inside of "",
         to: `${req.session.data.userinfo.email}`, // User email (recommendly dont touch)
         subject: `${process.env.email_system.extra.dashboardname} | Server Modified`, // EMail Subject
         html: contentHTML 
     })
 
     console.log('Message sent: %s', info.messageId);
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
