// Require modules
const dotenv = require('dotenv');
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

/**
 * Replaces placeholders in environment variables.
 *
 * Code has been taken from [dotenv-expand](https://github.com/motdotla/dotenv-expand), which is releases
 * under the [BSD-2-Clause License](https://github.com/motdotla/dotenv-expand/blob/v5.1.0/LICENSE).
 *
 * This is a slightly modified version where the values are read directly from `process.env`.
 *
 * See the [source code](https://github.com/motdotla/dotenv-expand/blob/v5.1.0/lib/main.js) for reference.
 *
 * @param {string} envValue The value taken from the environment.
 * @returns {string} The interpolated value.
 * @copyright 2016 Scott Motte
 * @version 5.1.0
 */
function interpolate(envValue) {
	const matches = envValue.match(/(.?\${?(?:[a-zA-Z0-9_]+)?}?)/g) || [];

	return matches.reduce(function (newEnv, match) {
		const parts = /(.?)\${?([a-zA-Z0-9_]+)?}?/g.exec(match);
		const prefix = parts[1];

		let value, replacePart;

		if (prefix === '\\') {
			replacePart = parts[0];
			value = replacePart.replace('\\$', '$');
		} else {
			const key = parts[2];
			replacePart = parts[0].substring(prefix.length);
			// process.env value 'wins' over .env file's value
			value = process.env.hasOwnProperty(key) ? process.env[key] : '';

			// Resolve recursive interpolations
			value = interpolate(value);
		}

		return newEnv.replace(replacePart, value);
	}, envValue);
}

module.exports.load = () => {
	dotenv.config();
};

module.exports.setDefaults = () => {
	setDefaults({
		APP_LOCALE: 'en',
		APP_HOST: '127.0.0.1',
		APP_PORT: 8080,
		APP_URL: 'http://${APP_HOST}:${APP_PORT}',

		MONGO_HOST: 'localhost',
		MONGO_PORT: 27017,
		MONGO_USER: 'root',
		MONGO_PASS: 'root',
		MONGO_DB: 'github-starred-index',
		MONGO_URI: 'mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?retryWrites=true&w=majority',

		HTTP_LOGGING_ENABLED: true,
		HTTP_LOGGING_FORMAT: 'short',

		SCHEDULER_UPDATE_INDEX_INTERVAL: '0 * * * *',
	});
};

module.exports.expandEnvironment = () => {
	for (const key in process.env) {
		if (Object.hasOwnProperty.call(process.env, key)) {
			const value = process.env[key];
			process.env[key] = interpolate(value);
		}
	}
};

module.exports.checkRequired = () => {
	if (! [ 'production', 'debug' ].includes( process.env.NODE_ENV )) {
		fail(`Invalid environment "${process.env.NODE_ENV}"! NODE_ENV must be either "production" or "debug".`);
	}
	envUtil.require([ 'APP_KEY', 'GITHUB_API_TOKEN' ]);
};
