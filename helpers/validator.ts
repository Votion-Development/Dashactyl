import * as assert from 'assert';
import type { BaseSettings } from '../models/settings';

export default function (data: BaseSettings): void {
    assert.strictEqual(typeof data.port, 'number', 'Port must be a number.');
    assert.ok(data.port >= 1000, 'Port must be greater than or equal to 1000.');
    assert.ok(data.port <= 9000, 'Port must be less than or equal to 9000.');

    assert.strictEqual(typeof data.debug, 'boolean', 'Debug must be a boolean (true/false).');

    assert.strictEqual(typeof data.ensureSave, 'boolean', 'Ensure Save must be a boolean (true/false).');

    assert.ok(data.secret.length >= 32, 'App secret must be greater than or equal to 32 characters length.');

    assert.strictEqual(typeof data.pterodactyl.url, 'string', 'Pterodactyl URL must be a string.');
    assert.match(
        data.pterodactyl.url,
        /https:\/\/(?:[a-z0-9\.\-]+){2,256}/gi,
        'Pterodactyl domain must be a valid domain (not localhost or an IP).'
    );
    assert.strictEqual(typeof data.pterodactyl.key, 'string', 'Pterodactyl API key must be a string.');
    assert.ok(data.pterodactyl.key.length >= 30, 'Pterodactyl API key is invalid.');

    assert.strictEqual(typeof data.database, 'string', 'Database URI must be a string.');
    assert.match(
        data.database,
        /^(?:mongodb\+srv|mongodb:\/\/)/gi,
        'Database URI is an invalid MongoDB URI.'
    );

    assert.equal(typeof data.discord.id, 'string', 'Discord application ID must be a string number.');
    assert.match(data.discord.id, /\d{17,19}/g, 'Discord application ID is invalid.');
    if (data.discord.guildId) {
        assert.match(data.discord.guildId, /\d{17,19}/g, 'Discord guild ID is invalid.');
    }
    assert.strictEqual(typeof data.discord.secret, 'string', 'Discord application secret must be a string.');
    assert.ok(data.discord.secret.length >= 30, 'Discord application secret is invalid.');
    assert.strictEqual(typeof data.discord.token, 'string', 'Discord application token must be a string.');
    assert.ok(data.discord.token.length >= 50, 'Discord application token is invalid.');
    assert.strictEqual(typeof data.discord.callback, 'string', 'Discord application callback must be a string.');
    assert.ok(data.discord.callback.endsWith('/auth/callback'), 'Discord application callback is an invalid url.');
}
