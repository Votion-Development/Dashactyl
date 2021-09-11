const suspendCheck = require("./server suspension system.js");

module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/api/resources/set_package/:id", async (req, res) => {
        if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'set package')) {
            if (typeof req.body !== "object") return res.json({ error: process.api_messages.core.bodymustbeanobject });
            if (Array.isArray(req.body)) return res.json({ error: process.api_messages.core.bodycannotbeanarray });

            let user_id = req.params.id; // Discord ID.
            let userinfo = await process.db.fetchAccountDiscordID(user_id);
            if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid });

            let package = req.body.package;
            if (package !== null && typeof package !== "string") return res.json({ error: process.api_messages.package.mustbeastringornull });
            if (package !== null) if (!process.env.packages.list[package]) return res.json({ error: process.api_messages.package.invalidpackage });

            if (!package) {
                await process.db.setPackageByDiscordID(user_id, null); // idk if this works
            } else {
                await process.db.setPackageByDiscordID(user_id, package);
            }

            res.json({
                error: process.api_messages.core.noError,
                package: package,
                user_id: user_id
            });

            suspendCheck(user_id);
        };
    });

};