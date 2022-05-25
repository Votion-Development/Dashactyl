const yaml = require('yaml');
const { join } = require('path');
const { readFileSync } = require('fs');

function loadWebconfig() {
    return yaml.parse(readFileSync(
        join(__dirname, '../webconfig.yml'),
        { encoding: 'utf-8' }
    ));
}

module.exports = {
    loadWebconfig
}