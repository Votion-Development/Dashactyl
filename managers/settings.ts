import { ISettings, Settings } from '../models/settings';

async function create() {
    const key = Math
        .random()
        .toString(16)
        .substring(2, 10)
        .toUpperCase();

    await new Settings({
        key,
        api:{
            enabled: true,
            keys: [],
            users: true,
            packages: true,
            coupons: true,
            eggs: true
        },
        afk:{
            enabled: false
        },
        renewals:{
            enabled: false,
            duration: 0,
            suspend: false,
            cost: 0
        },
        users:{
            create: false,
            update: false
        },
        servers:{
            create: false,
            update: false
        },
        coupons:{
            create: false,
            redeem: false,
            delete: false
        },
        referrals:{
            create: false
        }
    }).save();
    console.log(`GENERATED KEY: ${key}`);
}

async function fetch(key: string) {
    return await Settings.findOne({ key });
}

async function update(key: string, options: Partial<ISettings>) {
    let set = await Settings.findOne({ key });
    set = Object.assign(set, options);
    return await Settings.findOneAndUpdate(
        { key }, { $set: set }, { new: true }
    );
}

export default {
    fetch,
    create,
    update
}
