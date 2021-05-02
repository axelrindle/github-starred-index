// Require modules
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { Logger } = require('./logger');
const fail = require('./util/fail');
const envUtil = require('./util/env');

// Load environment
try {
	const env = dotenv.config();

	// put defaults
	envUtil.setDefault('APP_HOST', '127.0.0.1');
	envUtil.setDefault('APP_PORT', 8080);

	dotenvExpand(env);
} catch (error) {
	fail(error);
}

// Startup checks
if (! [ 'production', 'debug' ].includes( process.env.NODE_ENV )) {
    fail(`Invalid environment "${process.env.NODE_ENV}"! NODE_ENV must be either "production" or "debug".`);
}
envUtil.require([ 'APP_KEY', 'APP_URL' ]);
envUtil.require([ 'GITHUB_API_TOKEN' ]);

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
