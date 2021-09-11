const fetch = require('node-fetch');
const functions = require("../functions.js");
const renew_server = require("./renew server.js");
const suspendCheck = require("./server suspension system.js");

module.exports.load = async function(app, ifValidAPI, ejs) {
    app.post("/servers/delete/:id",

    process.rateLimit({
        windowMs: 500,
        max: 1,
        message: "You have been requesting this endpoint too fast. Please try again."
    }),

    async (req, res) => {
        let redirects = process.pagesettings.redirectactions.delete_server;
        if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin);

        let server_id = req.params.id;

        let deletionresults = await fetch(
            `${process.env.pterodactyl.domain}/api/application/servers/${server_id}`,
            {
                method: "delete",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.pterodactyl.key}`
                }
            }
        );

        let ok = await deletionresults.ok;
        if (!ok) return functions.doRedirect(req, res, redirects.errorondeletion);

        renew_server.remove(server_id);
        
        req.session.data.panelinfo.relationships.servers.data = req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() !== server_id);

        functions.doRedirect(req, res, redirects.deletedserver);

        suspendCheck(req.session.data.userinfo.id);
    });
};