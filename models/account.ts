import { Schema, model } from 'mongoose';
const { Types } = Schema;

export interface Resources {
    memory:     number;
    disk:       number;
    cpu:        number;
    servers:    number;
    coins:      number;
}

export interface IAccount {
    id:             string;
    username:       string;
    email:          string;
    password:       string;
    avatar:         string;
    resources:      Resources;
    package:        string;
    referral:       string | null;
    permissions:    number[];
    suspended:      boolean;
    createdAt:      number;
    lastLogin:      number;
}

const Model = new Schema<IAccount>({
    id:{
        type: Types.String,
        auto: true
    },
    username: Types.String,
    email: Types.String,
    password: Types.String,
    avatar: Types.String,
    resources: Types.Map,
    package: Types.String,
    referral: Types.String,
    permissions: [Types.Number],
    suspended: Types.Boolean,
    createdAt: Types.Number,
    lastLogin: Types.Number
});

export const Account = model('Account', Model, 'users');
