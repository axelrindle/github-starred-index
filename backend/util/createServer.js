// Require modules
const fs = require('fs').promises;
const http = require('http');
const https = require('https');
// const spdy = require('spdy'); FIXME: not working with docker
const { Logger } = require('../logger');

/**
 * Creates an HTTP server based on the environment settings.
 * Either HTTP/1.1, HTTPS/1.1 or HTTP/2
 *
 * @param {import('express').Application} app
 * @returns {Promise<http.Server|https.Server|spdy.Server>}
 */
module.exports = async (app) => {
	/** @type {Logger} */
	const logger = app.get('logger');
	const secure = process.env.APP_URL?.startsWith('https') ?? false;

	logger.debug(`Starting secure server: ${secure}`);

	if (secure) {
		return https.createServer( {
			cert: await fs.readFile(process.env.HTTPS_CERTIFICATE_FILE),
			key: await fs.readFile(process.env.HTTPS_CERTIFICATE_KEY)
		}, app );
	}
	else {
		return http.createServer( {}, app );
	}
};
