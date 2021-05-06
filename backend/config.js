// Require modules
const envUtil = require('./util/env');
const fail = require('./util/fail');

function setDefaults(defaults) {
	for (const key in defaults) {
		if (Object.hasOwnProperty.call(defaults, key)) {
			const value = defaults[key];
			envUtil.setDefault(key, value);
		}
	}
}

module.exports.setDefaults = () => {
	setDefaults({
		'APP_LOCALE': 'en',
		'APP_HOST': '127.0.0.1',
		'APP_PORT': 8080,

		'SCHEDULER_UPDATE_INDEX_INTERVAL': '0 * * * *'
	});
};

module.exports.checkRequired = () => {
	if (! [ 'production', 'debug' ].includes( process.env.NODE_ENV )) {
		fail(`Invalid environment "${process.env.NODE_ENV}"! NODE_ENV must be either "production" or "debug".`);
	}
	envUtil.require([ 'APP_KEY', 'APP_URL' ]);
	envUtil.require([ 'GITHUB_API_TOKEN' ]);
}
