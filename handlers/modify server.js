const fetch = require('node-fetch');
const functions = require("../functions.js");
const suspendCheck = require("./server suspension system.js");

module.exports.load = async function(app, ifValidAPI, ejs) {

    app.post("/servers/modify/:id", 
    
    process.rateLimit({
        windowMs: 500,
        max: 1,
        message: "You have been requesting this endpoint too fast. Please try again."
    }),
    
    async (req, res) => {
        let redirects = process.pagesettings.redirectactions.modify_server;
        if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin);

        let server_id = req.params.id;

        if (req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() == server_id).length !== 1) return functions.doRedirect(req, res, redirects.invalidserver);

        let server = req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() == server_id)[0];

        let eggs = Object.entries(process.env.eggs).filter(egg => server.attributes.egg == egg[1].info.egg);
        if (eggs.length !== 1) return functions.doRedirect(req, res, redirects.missingegg);
        let egg = eggs[0][1];

        let { total, current } = await functions.getUserResource(req);

        if (!req.body.memory && !req.body.disk && !req.body.cpu) return functions.doRedirect(req, res, redirects.missingresources, `?id=${req.params.id}`);
        if (!(await functions.parseNumber(req.body.memory)) || !(await functions.parseNumber(req.body.disk)) || !(await functions.parseNumber(req.body.cpu))) return functions.doRedirect(req, res, redirects.invalidresources, `?id=${req.params.id}`);

        let memory = await functions.parseNumber(req.body.memory) || server.attributes.limits.memory;
        let disk = await functions.parseNumber(req.body.disk) || server.attributes.limits.disk;
        let cpu = await functions.parseNumber(req.body.cpu) || server.attributes.limits.cpu;

        if (!memory || !disk || !cpu) return functions.doRedirect(req, res, redirects.invalidresources, `?id=${req.params.id}`);

        if (
            memory + current.memory - server.attributes.limits.memory > total.memory ||
            disk + current.disk - server.attributes.limits.disk > total.disk ||
            cpu + current.cpu - server.attributes.limits.cpu > total.cpu
        ) return functions.doRedirect(req, res, redirects.resourcesexceedplan, `?id=${req.params.id}`);

        for (let [type, value] of Object.entries(egg.minimum)) {
            if (value && eval(type) < value)
                return functions.doRedirect(req, res, redirects.toolittleresources, `?id=${req.params.id}`);
            }

        for (let [type, value] of Object.entries(egg.maximum))
            if (value && eval(type) > value)
                return functions.doRedirect(req, res, redirects.toomanyresources, `?id=${req.params.id}`);

        if (
            memory == server.attributes.limits.memory &&
            disk == server.attributes.limits.disk &&
            cpu == server.attributes.limits.cpu
        ) return functions.doRedirect(req, res, redirects.nochanges, `?id=${req.params.id}`);

        let limits = {
            memory: memory,
            disk: disk,
            cpu: cpu,
            swap: server.attributes.limits.swap,
            io: server.attributes.limits.io
        };

        let serverinfo_req = await fetch(
            `${process.env.pterodactyl.domain}/api/application/servers/${req.params.id}/build`,
            {
              method: "patch",
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}`, Accept: "application/json" },
              body: JSON.stringify({
                limits: limits,
                feature_limits: server.attributes.feature_limits,
                allocation: server.attributes.allocation
              })
            }
        );

        if (await serverinfo_req.statusText !== "OK") return functions.doRedirect(req, res, redirects.erroronmodification, `?id=${req.params.id}`);

        let serverinfo = await serverinfo_req.json();

        let new_all_server_data = req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() !== server_id);
        new_all_server_data.push(serverinfo);
        req.session.data.panelinfo.relationships.servers.data = new_all_server_data;

        functions.doRedirect(req, res, redirects.modifiedserver, `?id=${req.params.id}`);
        suspendCheck(req.session.data.userinfo.id);
    });

};