/* eslint-disable camelcase */
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const functions = require('../functions.js')

module.exports = async (discord_id, isAdmin) => {
  // console.error()s should be impossible to get if you set it up properly.

  const userinfo = await process.db.fetchAccountDiscordID(discord_id)
  if (!userinfo) return console.error(`[SERVER SUSPENSION] Could not find user database information. | User ID: ${discord_id}`)

  if (userinfo.blacklisted) return

  const account_info_json = await fetch(
        `${process.env.pterodactyl.domain}/api/application/users/${userinfo.pterodactyl_id}?include=servers`,
        {
          method: 'get',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
        }
  )

  if (await account_info_json.statusText === 'Not Found') return console.error(`[SERVER SUSPENSION] Could not find user panel information. | User ID: ${discord_id} | Pterodactyl Panel ID: ${userinfo.pterodactyl_id}`)

  const panelinfo = (await account_info_json.json()).attributes

  const fake_req = {
    session: {
      data: {
        dbinfo: userinfo,
        panelinfo: panelinfo
      }
    }
  }

  const { current, total } = await functions.getUserResource(fake_req)

  // Once again, lazy sh*t killing senior developers code. - Two

  if (current.memory > total.memory || current.disk > total.disk || current.cpu > total.cpu || current.servers > total.servers) {
    for (const server of panelinfo.relationships.servers.data) {
      const id = server.attributes.id

      if (!isAdmin) {
        await fetch(
                    `${process.env.pterodactyl.domain}/api/application/servers/${id}/suspend`,
                    {
                      method: 'post',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
                    }
        )
      }
    }
  } else {
    for (const server of panelinfo.relationships.servers.data) {
      const id = server.attributes.id

      const renewal_date = await process.db.getSingleRenewalDate(id)

      if (renewal_date.action === 'suspend' || renewal_date.action === 'auto' || renewal_date.action === '???') {
        await fetch(
                    `${process.env.pterodactyl.domain}/api/application/servers/${id}/unsuspend`,
                    {
                      method: 'post',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
                    }
        )
      }
    }
  }
}
