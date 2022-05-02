import { ISettings, Settings } from '../models/settings';

async function create() {
    const key = Math.random().toString(16).substring(2, 10);
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
}

async function update(options: ISettings) {
    return await Settings.findOneAndUpdate(
        { key: options.key }, options, { new: true }
    );
}

export default {
    create,
    update
}
