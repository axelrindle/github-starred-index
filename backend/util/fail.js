// Require modules
const { Logger } = require('../logger');

/**
 * Fails the process with an error message.
 *
 * @param {any} err
 */
module.exports = (err) => {
	const myLogger = new Logger('main');
	myLogger.error(err?.message ?? 'An error occured!');
	console.error(err);
	process.exit(-1);
};
