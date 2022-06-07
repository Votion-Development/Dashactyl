const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const log = require('./logger');
const functions = require('./functions');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");
const fetch = require('node-fetch');

const webconfig = functions.loadWebconfig();

let client;
let db;

if (!webconfig.connection_uri) {
    log.error("There is no connection URI set in webconfig.yml. Please set this.").then(() => {
        process.exit(1);
    });
} else {
    client = new MongoClient(webconfig.connection_uri);
    db = client.db(webconfig.database);
}

(async () => {
    await client.connect();
    log.database('Connected to the database.');

    /*
    const collection = db.collection("users");
    const password = "123456";
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            await collection.insertOne({
                username: "jamie",
                email: "volcanomonster07@gmail.com",
                pterodactyl_id: "",
                password: hash,
                used_ram: 0,
                used_cpu: 0,
                used_disk: 0,
                package: "default",
                extra: {
                    ram: 0,
                    cpu: 0,
                    disk: 0
                }
            });
        });
    });
    */

    const COLLECTIONS = [
        'settings', 'users', 'sessions', 'packages'
    ];

    for (const coll of COLLECTIONS) {
        db.listCollections({ name: coll }).next((_, data) => {
            if (!data) {
                db.createCollection(coll, async (err, doc) => {
                    if (err) {
                        log.error(
                            `There was an error while creating the '${coll}' collection in the database. ` +
                            "Please make sure that the connection URI is correct and that the user " +
                            "has the correct permissions to create collections."
                        );
                    } else {
                        log.database(`Created the '${coll}' collection.`);
                    }
                    if (coll === 'settings') {
                        await doc.insertOne({
                            id: 1,
                            name: 'Dashactyl',
                            host_name: '',
                            pterodactyl_url: '',
                            pterodactyl_key: '',
                            discord_invite: '',
                            discord_id: '',
                            discord_secret: '',
                            discord_token: '',
                            discord_webhook: '',
                            discord_guild: '',
                            registered_role: '',
                            default_package: "default",
                            afk_interval: 0,
                            afk_coins: 0,
                            arcio_code: '',
                        });
                    } else if (coll === 'packages') {
                        await doc.insertOne({
                            name: 'default',
                            ram: 1024,
                            cpu: 100,
                            disk: 1024,
                            price: 100,
                            default: true
                        });
                    }
                });
            }
        });
    }
})();

module.exports = {
    getSettings: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("settings");
            const res = await collection.find({}).toArray();
            const settings = res[0]
            resolve(settings);
        });
    },
    setSettings: async function (body) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("settings");
            await collection.updateOne({ id: 1 }, { $set: { host_name: body.host_name, pterodactyl_url: body.pterodactyl_url, pterodactyl_key: body.pterodactyl_key, discord_invite: body.discord_invite, discord_id: body.discord_id, discord_secret: body.discord_secret, discord_token: body.discord_token, discord_webhook: body.discord_webhook, discord_guild: body.discord_guild, registered_role: body.registered_role, afk_interval: body.afk_interval, } });
            resolve(true)
        });
    },
    getUser: async function (email) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const filteredDocs = await collection.findOne({
                email: email,
            });
            resolve(filteredDocs);
        });
    },
    getUserUsername: async function (username) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const filteredDocs = await collection.findOne({
                username: username,
            });
            resolve(filteredDocs);
        });
    },
    setUserPteroID: async function (username, id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            await collection.updateOne({ username: username }, { $set: { pterodactyl_id: id } });
            resolve(true);
        });
    },
    verifyPassword: async function (email, password) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) reject(false)
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    resolve(true)
                } else {
                    reject(false)
                }
            });
        });
    },
    matchPasswords: async function (email, password) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) reject(false)
            if (user.password === password) {
                resolve(true)
            } else {
                reject(false)
            }
        });
    },
    createUser: async function (username, email, password, type, discord_id, discord_discriminator) {
        return new Promise(async (resolve, reject) => {
            const settings = await this.getSettings()
            const collection = db.collection("users");
            const filteredDocs = await collection.findOne({
                email: email,
            });
            console.log(filteredDocs)
            if (filteredDocs) {
                resolve("That email address is already in use.")
            } else {
                const filteredDocs2 = await collection.findOne({
                    username: username,
                });
                if (filteredDocs2) {
                    resolve("That username is already in use.")
                } else {
                    if (type === "discord") {
                        await collection.insertOne({
                            username: username,
                            email: email,
                            pterodactyl_id: "",
                            password: "DISCORD LOGIN",
                            used_ram: 0,
                            used_cpu: 0,
                            used_disk: 0,
                            package: settings.default_package,
                            extra: {
                                ram: 0,
                                cpu: 0,
                                disk: 0
                            },
                            coins: 0,
                        });
                        resolve(true)
                    } else if (type === "credentials") {
                        bcrypt.genSalt(saltRounds, function (err, salt) {
                            bcrypt.hash(password, salt, async function (err, hash) {
                                await collection.insertOne({
                                    username: username,
                                    email: email,
                                    pterodactyl_id: "",
                                    password: hash,
                                    used_ram: 0,
                                    used_cpu: 0,
                                    used_disk: 0,
                                    package: settings.default_package,
                                    extra: {
                                        ram: 0,
                                        cpu: 0,
                                        disk: 0
                                    },
                                    coins: 0,
                                });
                                resolve(true)
                            });
                        })
                    }
                }
            }
        })
    },
    getPackage: async function (name) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("packages");
            const filteredDocs = await collection.findOne({
                name: name,
            });
            resolve(filteredDocs);
        });
    },
    addCoins: async function (email, coins) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) return DDresolve("User not found.")
            await collection.updateOne({ email: email }, { $inc: { coins: coins } });
            resolve(true);
        });
    }
};