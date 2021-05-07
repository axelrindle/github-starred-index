// Require modules
const fail = require('./fail');

function check(envVar) {
	return Object.prototype.hasOwnProperty.call(process.env, envVar);
}

function onFail(envVar) {
	fail(envVar + ' env variable not found!');
}

/**
 * Installs default environment variables when they're not present.
 *
 * @param {string} name The variable name.
 * @param {any} def The default value.
 */
module.exports.setDefault = (name, def) => {
	if (! process.env[name]) {
		process.env[name] = def;
	}
};

/**
 * Verifies the existence of the given env variables, otherwise terminates the application.
 * If found, the variables must hold a [truthy value](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).
 *
 * @param {string[]} varArray
 */
module.exports.require = varArray => {
	varArray.forEach(envVar => {
		if (! check(envVar)) {
			onFail(envVar);
		}
	});
};
