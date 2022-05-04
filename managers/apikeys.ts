import { ApiKey } from '../models/apikey';

async function fetch() {
    return await ApiKey.find({});
}

async function getById(id: string) {
    return await ApiKey.findOne({ id });
}

async function getFromUser(user: string) {
    return await ApiKey.find({ user });
}

async function increment(id: string) {
    await ApiKey.findOneAndUpdate(
        { id }, { $set:{ lastUsedAt: Date.now() }}
    );
}

async function create(user: string, permissions: number[] = []) {
    return await new ApiKey({
        user,
        permissions,
        createdAt: Date.now()
    }).save();
}

async function update(id: string, permissions: number[]) {
    return await ApiKey.findOneAndUpdate(
        { id }, { $set: permissions }, { new: true }
    );
}

async function _delete(id: string) {
    await ApiKey.findOneAndDelete({ id });
}

export default {
    fetch,
    getById,
    getFromUser,
    increment,
    create,
    update,
    delete: _delete
}
