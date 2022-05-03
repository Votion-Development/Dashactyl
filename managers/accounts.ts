import { createHash } from 'crypto';
import { IAccount, Account } from '../models/account';

async function fetch() {
    return await Account.find({});
}

async function get(email: string) {
    return await Account.findOne({ email });
}

function hashMatch(account: IAccount, password: string) {
    password = createHash('sha256')
        .update(password)
        .digest()
        .toString();

    return account.password === password;
}

async function create(options: IAccount) {
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
    fetch,
    get,
    hashMatch,
    create,
    update,
    delete: _delete
}
