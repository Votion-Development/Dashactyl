"use strict";

const fetch = require('node-fetch');
const db = require('../db.js');
const functions = require("../functions.js");

let renewal_timers = {};

module.exports.load = async function(app, ifValidAPI, ejs) {

    let now = Date.now();

    for (let { server_id, date, action } of (await process.db.getAllRenewalTimers())) {
        let the_date = parseFloat(date);

        let time_left = the_date - now;

        if (time_left <= 0) {

            if (action == "suspend" || action == "auto") {
                let dosuspendactions = true;

                if (action == "auto") {
                    let coinstotakeaway = 0;

                    let server_info_req = await fetch(
                        `${process.env.pterodactyl.domain}/api/application/servers/${server_id}`,
                        {
                            method: "get",
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${process.env.pterodactyl.key}`
                            }
                        }
                    );
    
                    let server_info = await server_info_req.json();
    
                    let cost = process.env.renewal.renew_fee;
    
                    let user_info = await process.db.fetchAccountPterodactylID(server_info.attributes.user);

                    if (user_info) {
                        let coins = user_info.coins;

                        let successful_loop = true;

                        if (coins >= cost) {
                            coinstotakeaway += cost;

                            let another_date_check = the_date + process.env.renewal.renewal_time;

                            if (another_date_check - now <= 0) {
                                coinstotakeaway += cost;

                                let end_loop = false;
                                successful_loop = false;

                                while (!end_loop) {
                                    if (coins < coinstotakeaway + cost) {
                                        await process.db.addCoinsByDiscordID(user_info.discord_id, -coinstotakeaway);
                                        end_loop = true;
                                    } else if (another_date_check - now <= 0) {
                                        coinstotakeaway += cost;
                                    } else {
                                        successful_loop = true;
                                        end_loop = true;
                                    }

                                    if (!end_loop) another_date_check = another_date_check + process.env.renewal.renewal_time;
                                }

                                if (!successful_loop) {
                                    await process.db.addCoinsByDiscordID(user_info.discord_id, -coinstotakeaway);
                                    the_date = another_date_check; // CHECK IF THIS IS RIGHT.
                                }
                            }

                            if (successful_loop) {
                                await process.db.addCoinsByDiscordID(user_info.discord_id, -coinstotakeaway);
                                await this.set(server_id, undefined, "auto");
                                dosuspendactions = false;
                            }
                        }

                        // If the user doesn't enough coins, it will just move onto the suspend process.
                    }
                }

                if (dosuspendactions) {
                    the_date += process.env.renewal.deletion_time;

                    let time_left_2 = the_date - now;
        
                    if (time_left_2 <= 0) {
                        await fetch(
                            `${process.env.pterodactyl.domain}/api/application/servers/${server_id}`,
                            {
                                method: "delete",
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${process.env.pterodactyl.key}`
                                }
                            }
                        );
        
                        await this.remove(server_id)
                    } else {
                        process.db.runDBTimerActions(server_id, the_date, "deletion");
        
                        await this.setDeletion(server_id, time_left_2);
                    }
                }

            } else if (action == "deletion") {
                await fetch(
                    `${process.env.pterodactyl.domain}/api/application/servers/${server_id}`,
                    {
                        method: "delete",
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${process.env.pterodactyl.key}`
                        }
                    }
                );

                await this.remove(server_id)
            }
        } else {
            if (action == "suspend") {
                await this.set(server_id, time_left);
            } else if (action == "auto") {
                await this.set(server_id, time_left, "auto");
            } else if (action == "deletion") {
                await this.setDeletion(server_id, time_left);
            }
        }
    }

    app.post("/servers/renew/:id", 
    
    process.rateLimit({
        windowMs: 500,
        max: 1,
        message: "You have been requesting this endpoint too fast. Please try again."
    }),
    
    async (req, res) => {
        let redirects = process.pagesettings.redirectactions.renew_server;

        if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin);

        let { current, total } = await functions.getUserResource(req);
        if (current.memory > total.memory || current.disk > total.disk || current.cpu > total.cpu || current.servers > total.servers) return functions.doRedirect(req, res, redirects.cannotrenewduetohavingmoreresourcesthanyoushouldbeabletohave);

        let server_id = req.params.id;
        if (req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() == server_id).length !== 1) return functions.doRedirect(req, res, redirects.invalidserver);

        let renewal_date = await db.getSingleRenewalDate(server_id);
        if (renewal_date.timer == "???") return functions.doRedirect(req, res, redirects.dontneedtorenew);

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

        if (renewal_date.action == "auto") {
            await this.set(server_id, undefined, "auto");
        } else {
            await this.set(server_id);
        }

        await fetch(
            `${process.env.pterodactyl.domain}/api/application/servers/${server_id}/unsuspend`,
            {
              method: "post",
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
            }
        );

        setTimeout(
            () => {
                functions.doRedirect(req, res, redirects.renewedserver);
            }, 100
        );
    });

    app.post("/servers/auto_renew/:id", 
    
    process.rateLimit({
        windowMs: 500,
        max: 1,
        message: "You have been requesting this endpoint too fast. Please try again."
    }),
    
    async (req, res) => {
        let redirects = process.pagesettings.redirectactions.auto_renew_server;

        if (!req.session.data || !req.session.data.userinfo) return functions.doRedirect(req, res, redirects.notsignedin);

        let server_id = req.params.id;
        if (req.session.data.panelinfo.relationships.servers.data.filter(server => server.attributes.id.toString() == server_id).length !== 1) return functions.doRedirect(req, res, redirects.invalidserver);

        let renewal_date = await db.getSingleRenewalDate(server_id);
        if (renewal_date.timer == "???") return functions.doRedirect(req, res, redirects.dontneedtorenew);

        if (renewal_date.action == "deletion") return functions.doRedirect(req, res, redirects.servermustberenewedfirstbecauseitisgoingtogetdeleted);
        if (parseFloat(renewal_date.timer) - Date.now() - 7000 <= 0) return functions.doRedirect(req, res, redirects.fewsecondstorenew);

        if (renewal_date.action == "suspend") {
            await db.runDBTimerActions(server_id, renewal_date.timer, "auto");
            return functions.doRedirect(req, res, redirects.toggledAuto);
        } else if (renewal_date.action == "auto") {
            await db.runDBTimerActions(server_id, renewal_date.timer, "suspend");
            return functions.doRedirect(req, res, redirects.toggledSuspend);
        } else {
            return functions.doRedirect(req, res, redirects.invalidrenewalstate);
        }
    });

};

module.exports.set = async function(server_id, timer, action) {
    if (renewal_timers[server_id]) clearTimeout(renewal_timers[server_id]);

    renewal_timers[server_id] = 
        setTimeout(async () => {
            let renewal_date = await db.getSingleRenewalDate(server_id);

            if (renewal_date.action == "auto") {
                let server_info_req = await fetch(
                    `${process.env.pterodactyl.domain}/api/application/servers/${server_id}`,
                    {
                        method: "get",
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${process.env.pterodactyl.key}`
                        }
                    }
                );

                let server_info = await server_info_req.json();

                let cost = process.env.renewal.renew_fee;

                let user_info = await process.db.fetchAccountPterodactylID(server_info.attributes.user);

                if (user_info) {
                    let coins = user_info.coins;

                    if (coins >= cost) {
                        await process.db.addCoinsByDiscordID(user_info.discord_id, -cost);
                        await this.set(server_id, undefined, "auto");
                        return;
                    }

                    // If the user doesn't enough coins, it will just move onto the suspend process.
                }
            }

            await fetch(
                `${process.env.pterodactyl.domain}/api/application/servers/${server_id}/suspend`,
                {
                method: "post",
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.pterodactyl.key}` }
                }
            );

            await this.setDeletion(server_id);
        }, timer || process.env.renewal.renewal_time); // 1 week.

    if (!timer) process.db.runDBTimerActions(server_id, Date.now() + process.env.renewal.renewal_time, action);
}

module.exports.setDeletion = async function(server_id, timer) {
    if (renewal_timers[server_id]) clearTimeout(renewal_timers[server_id]);

    renewal_timers[server_id] = 
        setTimeout(async () => {
            await fetch(
                `${process.env.pterodactyl.domain}/api/application/servers/${server_id}`,
                {
                    method: "delete",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.pterodactyl.key}`
                    }
                }
            );

            process.db.removeRenewTimerFromDB(server_id);
        }, timer || process.env.renewal.deletion_time); // 1 day.

    if (!timer) process.db.runDBTimerActions(server_id, Date.now() + process.env.renewal.deletion_time, "deletion");
}

module.exports.remove = async function(server_id) {
    if (renewal_timers[server_id]) clearTimeout(renewal_timers[server_id]);

    process.db.removeRenewTimerFromDB(server_id);
}