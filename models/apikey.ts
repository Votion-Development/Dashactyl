import { Schema, model } from 'mongoose';
const { Types } = Schema;

export interface IApiKey {
    id:             string;
    user:           string;
    permissions:    number[];
    createdAt:      number;
    lastUsedAt:     number;
}

const Model = new Schema<IApiKey>({
    id:{
        type: Types.String,
        auto: true
    },
    user: Types.String,
    permissions: [Types.Number],
    createdAt: Types.Number,
    lastUsedAt:{
        type: Types.Number,
        required: false
    }
});

export const ApiKey = model('ApiKey', Model, 'keys');
