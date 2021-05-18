// Require modules
const config = require('./config');
const { Logger } = require('./logger');
const fail = require('./util/fail');

// Load environment
try {
	config.load();
	config.setDefaults();
	config.expandEnvironment();
} catch (error) {
	fail(error);
}
config.checkRequired();

const logger = new Logger('main');

logger.info(`Running on node ${process.version}`);
logger.debug('Environment dump', process.env);

// Fail on uncaught exceptions or rejections
process.on('uncaughtExceptionMonitor', (err, _origin) => {
	fail('Uncaught exception monitoried!', err);
});
process.on('unhandledRejection', err => {
	fail('Unhandled promise rejection detected!', err);
});

async function boot() {
	// Create service container
	const container = await require('./container')();

	logger.info('Starting server...');
	require('./server')(container);
}

boot().catch(err => {
	fail('Booting failed!', err);
});
