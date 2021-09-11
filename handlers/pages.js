// NOTE FOR ANY DASHACTYL MODIFIERS: This file is needed or else index.js will error, unless correct modifications are made.

const fetch = require("node-fetch");
const functions = require("../functions.js");
const afk = require("./earn afk.js");

const yaml = require('js-yaml');
const fs = require("fs");
const status_replies = yaml.load(fs.readFileSync('./status replies.yml', 'utf8'));

const express = require("express");

module.exports.load = async function(app, ifValidAPI, ejs) {
    app.use('/assets', express.static('./frontend/assets')); // Makes the assets folder display on /assets.

    app.get("*", async (req, res) => {
        // makes pages.json and variables stuff
        //./frontend/pages/index.ejs

        let special;

        let file; // This is the variable that will hold the name of the file that should be opened and shown to the user.
        let type; // Sets the "type" variable, which will be the file type.

        if (req._parsedUrl.pathname == "/") {
            file = process.pagesettings.index; // The value of "index" on pages.yml is the page to be shown. 
        } else {
            // This gets the path name and removes the beginning and ending slashes.
            let pathname = req._parsedUrl.pathname.slice(1);

            if (pathname.slice(-1) == "/") pathname = pathname.slice(0, -1);

            // This checks if the path name exists on pages.yml exist.
            let checkexist = Object.entries(process.pagesettings.pages).filter(p => p[0] == pathname);

            if (checkexist.length == 0) { // Could not find path name on pages.yml, therefore it is a 404.
                res.status(404);
                file = process.pagesettings.notfound; // The value of "notfound" on pages.yml is the page to be shown. 
            } else if (checkexist.length == 1) { // Found the path name on pages.yml.
                const pathexists = checkexist[0][1];

                const permission = pathexists.permission; // This gets the value of the permission the user needs in order to view the page.

                if (pathexists.type) type = pathexists.type;

                if (permission == 0 || permission == 1 || permission == 2) { // Checks if it is a valid permission number.
                    /*
                        0 = Anyone can view the page.
                        1 = Only users logged in can view the page. 403 if not logged in.
                        2 = Only administrators can view the page. 404 if not an administrator.
                    */

                    if (permission == 1 || permission == 2) { // Must be signed in pages.
                        if (!req.session.data || !req.session.data.userinfo) {
                            if (pathexists.no_permission_redirect) return functions.doRedirect(req, res, pathexists.no_permission_redirect);
                            res.status(403);
                            file = process.pagesettings.nopermission; // The value of "nopermission" on pages.yml is the page to be shown. 
                        } else {
                            if (permission == 1) {
                                file = pathexists.file; // The value of the variable "file" on the path name object is the page to be shown.
                            } else if (permission == 2) {

                                if (!req.session.data.panelinfo.root_admin) { // If user isn't an administrator.
                                    if (pathexists.no_permission_redirect) returnfunctions.doRedirect(req, res, pathexists.no_permission_redirect);

                                    res.status(404);
                                    file = process.pagesettings.notfound; // The value of "notfound" on pages.yml is the page to be shown. 
                                } else { // If user is an administrator.
                                    file = pathexists.file; // The value of the variable "file" on the path name object is the page to be shown.
                                };
                            };
                        }
                    } else { // Pages anyone can go to. (no login required)
                        file = pathexists.file; // The value of the variable "file" on the path name object is the page to be shown.
                    };

                } else { // Permissions value on pages.yml for the path is not 0, 1, or 2.
                    console.log(`[WEBSITE] On the path "${pathname}", the permission value is invalid. The value must be 0 (everyone), 1 (logged in), or 2 (administrator).`);
                    return res.send("An error has occured while attempting to load this page. Please contact an administrator to fix this.");
                };

                if (pathexists.special) {
                    if (pathexists.special == "afk") {
                        let arcsessiontoken = Math.random().toString(36).substring(2, 15);

                        special = await afk.generateAfkSrc(arcsessiontoken);
                        special.type = "afk"; // Not necessary.

                        req.session.arcsessiontoken = {
                            token: arcsessiontoken,
                            created: special.created
                        }
                    } else {
                        console.log(`[WEBSITE] "${pathname}" had an invalid 'special' type.`);
                    }
                }
            } else { // Multiple instances of the path name exists within pages.yml.
                console.log(`[WEBSITE] Please remove one of the pages "${pathname}"s from the pages.yml object.`);
                return res.send("An error has occured while attempting to load this page. Please contact an administrator to fix this.");
            };
        };

        let packageinfo = null;
        let extra = null;
        let total = null;
        let current = null;
        let server_timers = null;
        
        if (req.session.data && req.session.data.dbinfo) {
            server_timers = {};

            for (let server of req.session.data.panelinfo.relationships.servers.data) // Inefficient, and can be slow if a person has a ton of servers.
                server_timers[server.attributes.id] = await process.db.getSingleRenewalDate(server.attributes.id);

            if (Object.entries(server_timers).filter(t => t[1].timer == "???").length !== 0) {
                let account_info_json = await fetch(
                    `${process.env.pterodactyl.domain}/api/application/users/${req.session.data.panelinfo.id}?include=servers`,
                    {
                        method: "get",
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
                    }
                );
        
                if (account_info_json.statusText !== "Not Found") {
                    let account_info = (await account_info_json.json()).attributes;
        
                    req.session.data.panelinfo = account_info;   
                }
            }
            
            let resources = await functions.getUserResource(req); // I can't use "let {packageinfo, extra, total, current}".

            packageinfo = resources.packageinfo;
            extra = resources.extra;
            total = resources.total;
            current = resources.current;
        }

        let variables = { // Creates "variables" object for what variables are to be sent frontend.
            variables: req.session.variables || null,
            data: req.session.data || null,
            settings: process.env,
            theme_settings: process.pagesettings,
            package: packageinfo,
            extra: extra,
            total: total,
            current: current,
            req: req,
            special: special,
            server_timers: server_timers,
            status_replies: status_replies
        };

        if (req.session.variables) delete req.session.variables; // Deletes any given variables from another path after it is set on the "variables" object.

        ejs.renderFile( // This renders the EJS file.
            `./frontend/pages/${file}`, // This is the file that gets rendered.
            variables, // Variables that are sent to frontend should be set here.
            null,
          async function (err, str) { // Function ran after the file has successfully rendered.
            if (err) {
                // EJS file had a rendering error.
                res.status(500);
                console.log(`[WEBSITE] An error has occured on path ${req._parsedUrl.pathname}:`);
                console.log(err);

                ejs.renderFile( // This renders the rendering error EJS file.
                    `./frontend/pages/${process.pagesettings.renderfail}`, // This is the file that gets rendered.
                    variables, // Variables that are sent to frontend should be set here.
                    null,
                async function (err, str) { // Function ran after the file has successfully rendered.
                    if (err) {
                        // Rendering error page has a error.
                        console.log(`[WEBSITE] An error has also occured while attempting to send the rendering error page on path ${req._parsedUrl.pathname}:`);
                        console.log(err);
                        return res.send("An error has occured while attempting to load this page. Please contact an administrator to fix this."); // Backup rendering error page.
                    };

                    res.send(str); // Sends rendering error page.
                });

                return;
            };

            if (type) res.type(type);
            res.send(str); // Sends the page.
        });
    });
};