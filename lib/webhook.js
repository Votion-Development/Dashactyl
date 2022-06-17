const fetch = require('node-fetch');
const log = require('./logger');
const db = require('./database');

module.exports = {
    info: async function (title, text) {
        const settings = await db.getSettings();
        fetch(`${settings.discord_webhook}`, {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [
                    {
                        title: title,
                        description: text,
                        color: 0,
                    }
                ]
            })
        }).catch(e => log.error("There was an error sending to the webhook: " + e));
    },
    success: async function (title, text) {
        const settings = await db.getSettings();
        fetch(`${settings.discord_webhook}`, {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [
                    {
                        title: title,
                        description: text,
                        color: 4321431,
                    }
                ]
            })
        }).catch(e => log.error("There was an error sending to the webhook: " + e));
    },
}