// Require modules
const { Logger } = require('../logger');

const myLogger = new Logger('main');

/**
 * Fails the process with an error message.
 *
 * @param {any} err
 */
module.exports = (err) => {
    myLogger.error(err?.message ?? 'An error occured!');
	console.error(err);
    process.exit(-1);
};
