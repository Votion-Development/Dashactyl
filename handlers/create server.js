const fetch = require('node-fetch');
const functions = require("../functions.js");
const renew_server = require("./renew server.js");

module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/servers/create",

    process.rateLimit({
        windowMs: 500,
        max: 1,
        message: "You have been requesting this endpoint too fast. Please try again."
    }),

    async (req, res) => {
        let redirects = process.pagesettings.redirectactions.create_server;
        if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin);

        let { total, current, packageinfo } = await functions.getUserResource(req);

        if (current.servers >= total.servers) return functions.doRedirect(req, res, redirects.exceedsserverplan);

        let location = req.body.location;
        if (typeof location !== "string") return functions.doRedirect(req, res, redirects.locationmustbeastring);
        if (!process.env.locations[location]) return functions.doRedirect(req, res, redirects.invalidlocation);

        if (!process.env.locations[location].enabled) return functions.doRedirect(req, res, redirects.locationdisabled);

        let egg = req.body.egg;
        if (typeof egg !== "string") return functions.doRedirect(req, res, redirects.eggmustbeastring);
        if (!process.env.eggs[egg]) return functions.doRedirect(req, res, redirects.invalidegg);

        if (Array.isArray(process.env.locations[location].package)) 
            if (!process.env.locations[location].package.includes(packageinfo.id)) 
                return functions.doRedirect(req, res, redirects.lockedlocationfrompackage);

        let name = req.body.name;

        if (typeof name !== "string") return functions.doRedirect(req, res, redirects.namemustbeastring);
        if (name.length < 1) return functions.doRedirect(req, res, redirects.nameistooshort);
        if (name.length > 191) return functions.doRedirect(req, res, redirects.nameistoolong);

        let memory = await functions.parseNumber(req.body.memory);
        let disk = await functions.parseNumber(req.body.disk);
        let cpu = await functions.parseNumber(req.body.cpu);

        if (!memory || !disk || !cpu) return functions.doRedirect(req, res, redirects.invalidresources);

        if (
            memory + current.memory > total.memory ||
            disk + current.disk > total.disk ||
            cpu + current.cpu > total.cpu
        ) return functions.doRedirect(req, res, redirects.resourcesexceedplan);

        for (let [type, value] of Object.entries(process.env.eggs[egg].minimum)) {
            if (value && eval(type) < value)
                return functions.doRedirect(req, res, redirects.toolittleresources);
            }

        for (let [type, value] of Object.entries(process.env.eggs[egg].maximum))
            if (value && eval(type) > value)
                return functions.doRedirect(req, res, redirects.toomanyresources);

        let specs = process.env.eggs[egg].info;
        specs.user = req.session.data.panelinfo.id;

        if (!specs.limits) specs.limits = {
            swap: 0,
            io: 500,
            backups: 0
        };

        if (process.env.locations[location].renewal) {
            let cost = process.env.renewal.renew_fee;
            let coins = await process.db.getCoinsByDiscordID(req.session.data.dbinfo.discord_id);
    
            if (coins < cost) {
                req.session.variables = {
                    cost: cost,
                    amount_needed: cost - coins
                }
                
                return functions.doRedirect(req, res, redirects.insufficientcoins);
            }
    
            await process.db.addCoinsByDiscordID(req.session.data.dbinfo.discord_id, -cost);
        }

        specs.name = name;
        specs.limits.memory = memory;
        specs.limits.disk = disk;
        specs.limits.cpu = cpu;

        if (!specs.deploy) specs.deploy = {
            locations: [],
            dedicated_ip: false,
            port_range: []
        }

        specs.deploy.locations = [parseFloat(location)];

        let serverinfo_req = await fetch(
            `${process.env.pterodactyl.domain}/api/application/servers`,
            {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.pterodactyl.key}`,
                    Accept: "application/json"
                },
                body: JSON.stringify(specs)
            }
        );

        if (serverinfo_req.statusText !== "Created") {
            console.log(await serverinfo_req.text());
            return functions.doRedirect(req, res, redirects.erroroncreation);
        }

        let serverinfo = await serverinfo_req.json();
        req.session.data.panelinfo.relationships.servers.data.push(serverinfo);

        if (process.env.locations[location].renewal) await renew_server.set(serverinfo.attributes.id);

        setTimeout( // setTimeout() to prevent the renewal timer accidently saying "None."
            () => {
                return functions.doRedirect(req, res, redirects.createdserver);
            }, 250
        );
    });

};