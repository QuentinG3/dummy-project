const { name, version } = require('../../package.json');

module.exports.read = async () => ({ name, version });
