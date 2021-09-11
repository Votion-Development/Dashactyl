const suspendCheck = require("./server suspension system.js");

module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/api/users/unblacklist/:id", async (req, res) => {
        if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'unblacklist user')) {
            let user_id = req.params.id; // Discord ID.
            let userinfo = await process.db.fetchAccountDiscordID(user_id);
            if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid });

            let blacklist_status = await process.db.blacklistStatus(user_id);
            if (!blacklist_status) return res.json({ error: process.api_messages.blacklist.notBlacklisted });

            await process.db.toggleBlacklist(user_id, false);

            suspendCheck(req.session.data.userinfo.id, req.session.data.panelinfo.root_admin);

            res.json({
                error: process.api_messages.core.noError
            });
        };
    });

};