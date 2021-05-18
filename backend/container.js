// Require modules
const EventEmitter = require('events');
const { asValue, createContainer, InjectionMode, Lifetime } = require('awilix');
const myLogger = require('./logger')('container');

module.exports = async () => {
	const container = createContainer({
		injectionMode: InjectionMode.PROXY,
	});

	// Register services
	container.register('eventbus', asValue(new EventEmitter()));

	container.loadModules(
		[
			['job/*.js', Lifetime.SINGLETON],
			['service/*.js', Lifetime.SINGLETON]
		],
		{
			cwd: __dirname,
			resolverOptions: {
				dispose: (registration) => {
					if (typeof registration.dispose === 'function') {
						registration.dispose();
					}
				}
			},
		}
	);
	myLogger.debug('Services registered.');

	await container.resolve('mongo').init();
	await container.resolve('scheduler').init();

	myLogger.info('Container initialized.');

	return container;
};
