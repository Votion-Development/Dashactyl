const { MongoClient } = require('mongodb');
const log = require('./logger');
const functions = require('./functions');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const events = require('./events').eventBus;

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
        'settings', 'users', 'sessions', 'packages', 'eggs', 'locations', 'renewals'
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
                            ram_price: 0,
                            cpu_price: 0,
                            disk_price: 0,
                        });
                    } else if (coll === 'packages') {
                        await doc.insertOne({
                            name: 'default',
                            ram: 1024,
                            cpu: 100,
                            disk: 1024,
                            price: 100,
                            renewal_enabled: false,
                            renewal_time: 20000,
                            renewal_price: 100,
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
            await collection.updateOne({ id: 1 }, { $set: { host_name: body.host_name, pterodactyl_url: body.pterodactyl_url, pterodactyl_key: body.pterodactyl_key, discord_invite: body.discord_invite, discord_id: body.discord_id, discord_secret: body.discord_secret, discord_token: body.discord_token, discord_webhook: body.discord_webhook, discord_guild: body.discord_guild, registered_role: body.registered_role, afk_interval: body.afk_interval, ram_price: body.ram_price, cpu_price: body.cpu_price, disk_price: body.disk_price } });
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
    addPackage: async function (data) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("packages");
            await collection.insertOne({
                name: data.name,
                ram: parseInt(data.ram),
                cpu: parseInt(data.cpu),
                disk: parseInt(data.disk),
                price: parseInt(data.price),
                renewal_enabled: data.renewal_enabled,
                renewal_time: parseInt(data.renewal_time),
                renewal_price: parseInt(data.renewal_price),
                default: false
            });
            resolve(true);
        });
    },
    addEgg: async function (data) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("eggs");
            await collection.insertOne({
                name: data.name,
                id: data.egg_id,
                docker_image: data.egg_docker_image,
                startup: data.egg_startup,
                databases: data.egg_databases,
                backups: data.egg_backups,
                environment: data.egg_environment,
            });
            resolve(true);
        });
    },
    getEggs: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("eggs");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs);
        });
    },
    getEgg: async function (name) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("eggs");
            const filteredDocs = await collection.findOne({
                name: name,
            });
            resolve(filteredDocs);
        });
    },
    addLocation: async function (data) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("locations");
            await collection.insertOne({
                id: data.location_id,
                name: data.name,
                enabled: data.location_idenabled,
            });
            resolve(true);
        });
    },
    updateLocationStatus: async function (data) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("locations");
            await collection.updateOne({ id: data.location }, { $set: { enabled: data.status } });
            resolve(true);
        });
    },
    getLocations: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("locations");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs);
        });
    },
    getLocation: async function (name) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("locations");
            const filteredDocs = await collection.findOne({
                name: name,
            });
            resolve(filteredDocs);
        })
    },
    getLocationByID: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("locations");
            const filteredDocs = await collection.findOne({
                id: id,
            });
            resolve(filteredDocs);
        })
    },
    addUsed: async function (email, cpu, ram, disk) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) return resolve("User not found.")
            const newcpu = parseInt(user.used_cpu) + parseInt(cpu)
            const newram = parseInt(user.used_ram) + parseInt(ram)
            const newdisk = parseInt(user.used_disk) + parseInt(disk)
            await collection.updateOne({ email: email }, { $set: { used_cpu: parseInt(newcpu), used_ram: parseInt(newram), used_disk: parseInt(newdisk) } });
            events.emit("userUpdate", email)
            resolve(true);
        });
    },
    setUsed: async function (email, cpu, ram, disk) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) return resolve("User not found.")
            console.log(cpu, ram, disk)
            await collection.updateOne({ email: email }, { $set: { used_cpu: parseInt(cpu), used_ram: parseInt(ram), used_disk: parseInt(disk) } });
            events.emit("userUpdate", email)
            resolve(true);
        });
    },
    updateCoins: async function (email, coins) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) return resolve("User not found.")
            await collection.updateOne({ email: email }, { $set: { coins: coins } });
            events.emit("userUpdate", email)
            resolve(true);
        });
    },
    updateExtraRam: async function (email, ram) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) return resolve("User not found.")
            await collection.updateOne({ email: email }, { $set: { "extra.ram": parseInt(ram) } });
            events.emit("userUpdate", email)
            resolve(true);
        });
    },
    updateExtraCpu: async function (email, cpu) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) return resolve("User not found.")
            await collection.updateOne({ email: email }, { $set: { "extra.cpu": parseInt(cpu) } });
            events.emit("userUpdate", email)
            resolve(true);
        });
    },
    updateExtraDisk: async function (email, disk) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) return resolve("User not found.")
            await collection.updateOne({ email: email }, { $set: { "extra.disk": parseInt(disk) } });
            events.emit("userUpdate", email)
            resolve(true);
        });
    },
    addRenewal: async function (email, id) {
        return new Promise(async (resolve, reject) => {
            const user = await this.getUser(email);
            if (!user) return resolve("User not found.")
            const package = await this.getPackage(user.package);
            if (!package) return resolve("Package not found.")
            const collection = db.collection("renewals");
            await collection.insertOne({
                server_id: id,
                email: email,
                renew_by: Date.now() + package.renewal_time,
                renew_cost: package.renewal_price,
                renewal_enabled: package.renewal_enabled
            });
            resolve(true);
        });
    },
    removeRenewal: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("renewals");
            await collection.deleteOne({ server_id: parseInt(id) });
            resolve(true);
        });
    },
    getRenewal: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("renewals");
            const filteredDocs = await collection.findOne({
                server_id: parseInt(id),
            });
            resolve(filteredDocs);
        });
    },
    getRenewals: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("renewals");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs);
        });
    },
    getUsersRenewals: async function (email) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("renewals");
            const filteredDocs = await collection.find({
                email: email,
            }).toArray();
            resolve(filteredDocs);
        });
    },
    updateRenewal: async function (id, renew_by) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("renewals");
            await collection.updateOne({ server_id: parseInt(id) }, { $set: { renew_by: parseInt(renew_by) } });
            resolve(true);
        });
    },
};