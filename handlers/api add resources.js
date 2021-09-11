const suspendCheck = require("./server suspension system.js");

module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/api/resources/add_resources/:id", async (req, res) => {
        if (req.session.data && req.session.data.panelinfo.root_admin || ifValidAPI(req, res, 'set resources')) {
            if (typeof req.body !== "object") return res.json({ error: process.api_messages.core.bodymustbeanobject });
            if (Array.isArray(req.body)) return res.json({ error: process.api_messages.core.bodycannotbeanarray });

            let user_id = req.params.id; // Discord ID.
            let userinfo = await process.db.fetchAccountDiscordID(user_id);
            if (!userinfo) return res.json({ error: process.api_messages.extra.invaliduserid });

            let resources = {
                memory: req.body.memory,
                disk: req.body.disk,
                cpu: req.body.cpu,
                servers: req.body.servers
            };

            let added_resources = {}; // because why not do it the lazy way. - Two

            let resource_check_errors = [];
            let test_if_all_null = 0;

            for (let [type, amount] of Object.entries(resources)) {
                if (amount == null) {
                    test_if_all_null++;
                } else if (typeof amount !== "number") {
                    resource_check_errors.push(process.api_messages.resources.mustbeanumber.replace(/{{type}}/g, type));
                } else {
                    amount = Math.round(amount);

                    // Straight up bad and lazy code: - Two

                    if (amount + userinfo[type] < 0) {
                        resource_check_errors.push(process.api_messages.resources.cannotbelessthanzero.replace(/{{type}}/g, type));
                    } else if (amount + userinfo[type] > 1073741823) { // Due to Javascript number limitations.
                        resource_check_errors.push(process.api_messages.resources.cannotbeoverabignumber.replace(/{{type}}/g, type));
                    } else {
                        resources[type] = amount + userinfo[type]; // To save rounding changes.
                        added_resources[type] = amount + userinfo[type];
                    };
                };
            };

            if (test_if_all_null == Object.entries(resources).length) return res.json({ error: process.api_messages.resources.nochanges });
            if (resource_check_errors.length !== 0) return res.json({ error: process.api_messages.resources.resourcecheckerrors, errors: resource_check_errors });

            await process.db.setResourcesByDiscordID(user_id, resources.memory, resources.disk, resources.cpu, resources.servers);

            res.json({
                error: process.api_messages.core.noError,
                new_resources: added_resources,
                user_id: user_id
            });

            suspendCheck(user_id);
        };
    });

};