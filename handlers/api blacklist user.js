const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports.load = async function (app, ifValidAPI, ejs) {
  app.post('/api/users/blacklist/:id', async (req, res) => {
    if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'blacklist user')) {
      const user_id = req.params.id // Discord ID.
      const userinfo = await process.db.fetchAccountDiscordID(user_id)
      if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid })

      const blacklist_status = await process.db.blacklistStatus(user_id)
      if (blacklist_status) return res.json({ error: process.api_messages.blacklist.alreadyBlacklisted })

      await process.db.toggleBlacklist(user_id, true)

      for (const server of req.session.data.panelinfo.relationships.servers.data) {
        await fetch(
                    `${process.env.pterodactyl.domain}/api/application/servers/${server.attributes.id}/suspend`,
                    {
                      method: 'post',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
                    }
        )
      };

      res.json({
        error: process.api_messages.core.noError
      })
    };
  })
}
