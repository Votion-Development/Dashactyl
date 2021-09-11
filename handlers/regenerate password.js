const fetch = require('node-fetch');
const functions = require("../functions.js");

module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/accounts/regenerate_password", 
    
    process.rateLimit({
        windowMs: 1000,
        max: 1,
        message: "You have been requesting this endpoint too fast. Please try again."
    }),

    async (req, res) => {
        let redirects = process.pagesettings.redirectactions.regenerate_password;
        if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin);

        let generated_password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        await fetch(
            `${process.env.pterodactyl.domain}/api/application/users/${req.session.data.dbinfo.pterodactyl_id}`,
            {
                method: "patch",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.pterodactyl.key}`
                },
                body: JSON.stringify({
                    username: req.session.data.panelinfo.username,
                    email: req.session.data.panelinfo.email,
                    first_name: req.session.data.panelinfo.first_name,
                    last_name: req.session.data.panelinfo.last_name,
                    password: generated_password
                })
            }
        );

        req.session.variables = {
            password: generated_password
        };

        return functions.doRedirect(req, res, redirects.success);
    });

};