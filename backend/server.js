// Require modules
const path = require('path');
const { URL } = require('url');
const express = require('express');
const agendash = require('agendash');
const { loadControllers, scopePerRequest } = require('awilix-express');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const eta = require('eta');
const session = require('express-session');
const helmet = require('helmet');
const favicon = require('serve-favicon');
const { createTerminus } = require('@godaddy/terminus');
const morgan = require('./middleware/morgan');
const isDebug = require('./util/isDebug');
const createServer = require('./util/createServer');

/**
 * @param {import('awilix').AwilixContainer} container
 */
module.exports = async (container) => {
	/** @type {import('./logger').Logger} */
	const myLogger = container.resolve('createLogger')('server');

	eta.configure({
		cache: !isDebug()
	});

	const app = express();
	app.engine('eta', eta.renderFile);
	app.set('container', container);
	app.set('logger', myLogger);
	app.set('views', 'frontend/views');
	app.set('view engine', 'eta');

	app.use(compression());
	app.use(helmet({
		contentSecurityPolicy: false
	}));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser(process.env.APP_KEY));
	app.use(session({
		secret: process.env.APP_KEY,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
			secure: process.env.APP_URL.startsWith('https')
		},
		store: MongoStore.create({
			client: mongo.getClient()
		})
	}));
	if (process.env.HTTP_LOGGING_ENABLED === 'true') {
		app.use(morgan(myLogger));
	}
	app.use(favicon(path.resolve('frontend/static/favicon.png')));
	app.use(express.static('frontend/static'));
	app.use('/dayjs', express.static('node_modules/dayjs/'));

	app.use((req, res, next) => {
		res.locals = {
			url: (_path = '') => {
				return new URL(_path, process.env.APP_URL).toString();
			},
			locale: process.env.APP_LOCALE
		};
		next();
	});

	app.use('/agendash', agendash(container.resolve('scheduler').getAgenda()));
	app.use(scopePerRequest(container));
	app.use(loadControllers('routes/*.js', { cwd: __dirname }));

	const host = process.env.APP_HOST;
	const port = parseInt(process.env.APP_PORT);
	const server = await createServer(app);
	server.listen(port, host, () => {
		myLogger.info(`Server listening on ${host}:${port}`);
	});

	// setup graceful shutdown
	createTerminus(server, {
		signals: ['SIGTERM', 'SIGINT'],
		onSignal: () => {
			myLogger.info('Shutdown...');
			return Promise.all([
				container.dispose()
			]);
		},
		// @ts-ignore
		onShutdown: () => {
			myLogger.info('Goodbye :)');
		},

		logger: myLogger.error.bind(myLogger)
	});

	// listen to shutdown events
	/** @type {NodeJS.EventEmitter} */
	const eventbus = container.resolve('eventbus');
	eventbus.once('shutdown', () => {
		process.emit('SIGTERM');
	});
};
