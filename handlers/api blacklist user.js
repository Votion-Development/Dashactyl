const fetch = require("node-fetch");

module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/api/users/blacklist/:id", async (req, res) => {
        if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'blacklist user')) {
            let user_id = req.params.id; // Discord ID.
            let userinfo = await process.db.fetchAccountDiscordID(user_id);
            if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid });

            let blacklist_status = await process.db.blacklistStatus(user_id);
            if (blacklist_status) return res.json({ error: process.api_messages.blacklist.alreadyBlacklisted });

            await process.db.toggleBlacklist(user_id, true);

            for (let server of req.session.data.panelinfo.relationships.servers.data) {
                await fetch(
                    `${process.env.pterodactyl.domain}/api/application/servers/${server.attributes.id}/suspend`,
                    {
                        method: "post",
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
                    }
                );
            };

            res.json({
                error: process.api_messages.core.noError
            });
        };
    });

};