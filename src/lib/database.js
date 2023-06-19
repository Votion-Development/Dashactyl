import { MongoClient } from 'mongodb';

let client;
let db;

if (!process.env.DATABASE_URI) {
    console.error('There is no connection URI set in webconfig.yml. Please set this.').then(() => {
        process.exit(1);
    });
} else {
    client = new MongoClient(process.env.DATABASE_URI);
    db = client.db(process.env.DATABASE);
}

module.exports = {
    settings: {
        get: async function () {
            return new Promise(async (resolve, reject) => {
                const collection = db.collection('settings');
                resolve((await collection.find({}).toArray())[0])
            });
        },
    },
    user: {
        create: async function (discord_id, pterodactyl_id, blacklisted, coins, plan, memory, disk, cpu, servers) {
            return new Promise(async (resolve, reject) => {
                const collection = db.collection('users');
                const filteredDocs = await collection.findOne({
                    discord_id
                });
                if (filteredDocs) {
                    reject('That username is already in use.');
                } else {
                    await collection.insertOne({
                        discord_id,
                        pterodactyl_id,
                        blacklisted,
                        coins,
                        plan,
                        memory,
                        disk,
                        cpu,
                        servers
                    });
                    resolve(true);
                }
            });
        },
        get: async function (discord_id) {
            return new Promise(async (resolve, reject) => {
                const collection = db.collection('users');
                resolve(await collection.findOne({ discord_id }));
            });
        },
    }
}