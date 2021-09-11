module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/api/j4r/create", async (req, res) => {
        // This endpoint is not supported on APIs.

        if (req.session.data && req.session.data.panelinfo.root_admin) { // || ifValidAPI(req, res, 'create j4r')
            if (typeof req.body !== "object") return res.json({ error: process.api_messages.core.bodymustbeanobject });
            if (Array.isArray(req.body)) return res.json({ error: process.api_messages.core.bodycannotbeanarray });

            let j4r_id = req.body.j4r_id;
            let server_id = req.body.server_id;
            let days = req.body.days;

            // Felt demotivated when making this, so lazy. - Two

            if (typeof j4r_id !== "string") return res.json({ error: process.api_messages.j4r.j4ridisnotastring });
            if (j4r_id.length == 0) return res.json({ error: process.api_messages.j4r.j4ridcannotbeempty });
            if (typeof server_id !== "string") return res.json({ error: process.api_messages.j4r.serveridisnotastring });

            if (typeof days !== "number") return res.json({ error: process.api_messages.j4r.daysisnotanumber });
            days = Math.round(days);
            if (days < 1) return res.json({ error: process.api_messages.j4r.dayscannotbelessthanone });
            if (days > 365) return res.json({ error: process.api_messages.j4r.dayscannotbegreaterthan365 });

            let expires_on = Date.now() + (days * 8.64e+7);

            let check_exists = await process.db.checkIfJ4RWithNameExists(j4r_id);
            if (check_exists) return res.json({ error: process.api_messages.j4r.alreadyexists });

            // Reason why this can't be an API endpoint. - everything is a comment by Two
            if (req.session.data.userinfo.guilds.filter(s => s.id == server_id).length !== 1) return res.json({ error: process.api_messages.j4r.notinj4rserver });
            // ^^^

            // Copy and paste go brr. - Two

            let resources = {
                memory: req.body.memory,
                disk: req.body.disk,
                cpu: req.body.cpu,
                servers: req.body.servers
            };

            let resource_check_errors = [];

            for (let [type, amount] of Object.entries(resources)) {
                if (typeof amount !== "number") {
                    resource_check_errors.push(process.api_messages.resources.mustbeanumber.replace(/{{type}}/g, type));
                } else {
                    amount = Math.round(amount);

                    // Straight up bad and lazy code: - Two

                    if (amount < 0) {
                        resource_check_errors.push(process.api_messages.resources.cannotbelessthanzero.replace(/{{type}}/g, type));
                    } else if (amount > 1073741823) { // Due to Javascript number limitations.
                        resource_check_errors.push(process.api_messages.resources.cannotbeoverabignumber.replace(/{{type}}/g, type));
                    } else {
                        resources[type] = amount; // To save rounding changes.
                    };
                };
            };

            if (resource_check_errors.length !== 0) return res.json({ error: process.api_messages.resources.resourcecheckerrors, errors: resource_check_errors });

            await process.db.createJ4R(j4r_id, server_id, expires_on, resources.memory, resources.disk, resources.cpu, resources.servers);

            res.json({
                error: process.api_messages.core.noError,
                j4r_id: j4r_id,
                server_id: server_id,
                days: days,
                expires_on: expires_on,
                resources: resources
            });
        };
    });

};