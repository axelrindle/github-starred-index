// Require modules
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { Logger } = require('./logger');
const fail = require('./util/fail');

// Load environment
const config = require('./config');
try {
	const env = dotenv.config();
	config.setDefaults();
	dotenvExpand(env);
} catch (error) {
	fail(error);
}
config.checkRequired();

const logger = new Logger('main');

logger.info(`Running on node ${process.version}`);
logger.debug('Environment dump', process.env);

// Fail on uncaught exceptions or rejections
process.on('uncaughtExceptionMonitor', (err, _origin) => {
    logger.error('Uncaught exception detected!');
    console.error(err);
    process.exit(1);
});
process.on('unhandledRejection', err => {
    logger.error('Unhandled promise rejection detected!');
    console.error(err);
    process.exit(1);
});

async function boot() {
    // Create service container
    const container = await require('./container')();

    logger.info('Starting server...');
    require('./server')(container);
}

boot().catch(fail);
