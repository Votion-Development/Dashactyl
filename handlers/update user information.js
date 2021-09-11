const fetch = require('node-fetch');
const functions = require("../functions.js");
const suspendCheck = require("./server suspension system.js");

module.exports.load = async function(app, ifValidAPI, ejs) {
    app.post("/accounts/update_information", 
    
    process.rateLimit({
        windowMs: 1000,
        max: 1,
        message: "You have been requesting this endpoint too fast. Please try again."
    }),
    
    async (req, res) => {
        let redirects = process.pagesettings.redirectactions.update_info;
        if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin);

        let guildinfo_raw = await fetch(
            'https://discord.com/api/users/@me/guilds',
            {
                method: "get",
                headers: {
                    Authorization: `Bearer ${req.session.data.userinfo.access_token}`
                }
            }
        );
      
        let guilds = await guildinfo_raw.json();
        if (!Array.isArray(guilds)) return functions.doRedirect(req, res, redirects.cannotgetguilds);

        req.session.data.userinfo.guilds = guilds;

        let account_info_json = await fetch(
            `${process.env.pterodactyl.domain}/api/application/users/${req.session.data.dbinfo.pterodactyl_id}?include=servers`,
            {
                method: "get",
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
            }
        );

        if (await account_info_json.statusText == "Not Found") return functions.doRedirect(req, res, redirects.error);

        let account_info = (await account_info_json.json()).attributes;
        req.session.data.panelinfo = account_info;

        suspendCheck(req.session.data.userinfo.id)
        await process.db.checkJ4R(req.session.data.userinfo.id, guilds);

        return functions.doRedirect(req, res, redirects.success);
    });
};