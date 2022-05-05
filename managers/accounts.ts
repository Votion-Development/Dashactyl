import { createHash } from 'crypto';
import { Account, IAccount, Resources } from '../models/account';

const DEFAULT_RESOURCES: Resources = {
    memory: 1024,
    disk: 1024,
    cpu: 10,
    servers: 1,
    coins: 0
}

async function fetch() {
    return await Account.find({});
}

async function get(id: string) {
    return (await Account.find({}))
        .find(d => d._id.toString() === id);
}

function hashMatch(account: IAccount, password: string) {
    password = createHash('sha256')
        .update(password)
        .digest()
        .toString();

    return account.password === password;
}

async function create(options: Omit<IAccount, 'id'>) {
    options.password = createHash('sha256')
        .update(options.password)
        .digest()
        .toString();

    return await new Account(options).save();
}

async function update(options: IAccount) {
    return await Account.findOneAndUpdate(
        { email: options.email }, options, { new: true }
    );
}

async function _delete(email: string) {
    await Account.findOneAndDelete({ email });
}

export default {
    DEFAULT_RESOURCES,
    fetch,
    get,
    hashMatch,
    create,
    update,
    delete: _delete
}
