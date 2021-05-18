// Require modules
const { Logger } = require('../logger');

/**
 * Fails the process with an error message.
 *
 * @param {any} err
 */
module.exports = (message, err) => {
	const myLogger = new Logger('main');
	myLogger.error(message, err);
	console.error(err);
	process.exit(-1);
};
