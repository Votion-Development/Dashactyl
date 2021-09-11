module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/api/users/add_coins/:id", async (req, res) => {
        if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'set coins')) {
            if (typeof req.body !== "object") return res.json({ error: process.api_messages.core.bodymustbeanobject });
            if (Array.isArray(req.body)) return res.json({ error: process.api_messages.core.bodycannotbeanarray });

            let user_id = req.params.id; // Discord ID.
            let userinfo = await process.db.fetchAccountDiscordID(user_id);
            if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid });

            let coins = req.body.coins;

            if (typeof coins !== "number") return res.json({ error: process.api_messages.coins.mustbeanumber });
            if (isNaN(coins)) return res.json({ error: process.api_messages.coins.cannotbenan }); // This might also not be possible.
            if (coins == Infinity) return res.json({ error: process.api_messages.coins.cannotbeinfinity }); // This might not be possible.

            res.json({
                error: process.api_messages.core.noError,
                coins: await process.db.addCoinsByDiscordID(user_id, coins),
                user_id: user_id
            });
        };
    });

};