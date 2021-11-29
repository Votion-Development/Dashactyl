/* eslint-disable camelcase */
/* eslint-disable no-mixed-operators */
module.exports.load = async function (app, ifValidAPI, ejs) {
  app.get('/api/users/info/:id', async (req, res) => {
    if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'user info')) {
      const user_id = req.params.id // Discord ID.
      const userinfo = await process.db.fetchAccountDiscordID(user_id)
      if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid })

      res.json({
        error: process.api_messages.core.noError,
        info: userinfo
      })
    };
  })
}
