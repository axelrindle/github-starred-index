// Require modules
const EventEmitter = require('events');
const awilix = require('awilix');
const myLogger = require('./logger')('container');

module.exports = async () => {
	const container = awilix.createContainer({
		injectionMode: awilix.InjectionMode.PROXY,
	});

	// Register services
	container.register('eventbus', awilix.asValue(new EventEmitter()));
	container.register('createLogger', awilix.asValue(require('./logger')));

	container.loadModules(['service/*.js', 'job/*.js'], {
		cwd: __dirname,
		resolverOptions: {
			dispose: (registration) => {
				if (typeof registration.dispose === 'function') {
					registration.dispose();
				}
			},
			lifetime: awilix.Lifetime.SINGLETON,
		},
	});
	myLogger.debug('Services registered.');

	await container.resolve('mongo').init();
	await container.resolve('scheduler').init();

	myLogger.info('Container initialized.');

	return container;
};
