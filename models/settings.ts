import { Schema, model } from 'mongoose';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
const { Types } = Schema;

export interface BaseSettings {
    port:           number;
    debug:          boolean;
    ensureSave:     boolean;
    secret:         string;
    pterodactyl:{
        url:        string;
        key:        string;
    }
    database:       string;
    discord:{
        id:         string;
        guildId:    string;
        secret:     string;
        token:      string;
        callback:   string;
        invite:     string;
    }
}

export function loadBase(path: string): BaseSettings {
    return parse(
        readFileSync(path, { encoding: 'utf-8' })
    );
}

export interface ISettings {
    key:            string;
    api:{
        enabled:    boolean;
        keys:       string[];
        users:      boolean;
        packages:   boolean;
        coupons:    boolean;
        eggs:       boolean;
    }
    afk:{
        enabled:    boolean;
    }
    renewals:{
        enabled:    boolean;
        duration:   boolean;
        suspend:    boolean;
        cost:       number;
    }
    users:{
        create:     boolean;
        update:     boolean;
    }
    servers:{
        create:     boolean;
        update:     boolean;
    }
    coupons:{
        create:     boolean;
        redeem:     boolean;
        delete:     boolean;
    }
    referrals:{
        create:     boolean;
    }
}

const Model = new Schema<ISettings>({
    key: Types.String,
    api:{
        enabled: Types.Boolean,
        keys: [Types.String],
        users: Types.Boolean,
        packages: Types.Boolean,
        coupons: Types.Boolean,
        eggs: Types.Boolean
    },
    afk:{
        enabled: Types.Boolean
    },
    renewals:{
        enabled: Types.Boolean,
        duration: Types.Number,
        suspend: Types.Boolean,
        cost: Types.Number
    },
    users:{
        create: Types.Boolean,
        update: Types.Boolean
    },
    servers:{
        create: Types.Boolean,
        update: Types.Boolean
    },
    coupons:{
        create: Types.Boolean,
        redeem: Types.Boolean,
        delete: Types.Boolean
    },
    referrals:{
        create: Types.Boolean
    }
});

export const Settings = model('Settings', Model, 'settings');
