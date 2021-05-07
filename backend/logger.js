// Require modules
const chalk = require('chalk');
const dayjs = require('dayjs');
const isDebug = require('./util/isDebug');

class Logger {
	constructor (tag) {
		this._tag = tag;

		const locale = process.env.APP_LOCALE;
		require('dayjs/locale/' + locale);
		dayjs.locale(locale);
		dayjs.extend(require('dayjs/plugin/localizedFormat'));
	}

	/**
	 *
	 * @param {import('stream').Writable} stream
	 * @param {string} level
	 * @param {string} message
	 * @param {any} meta
	 */
	_log(stream, level, message, meta = null) {
		const timestamp = dayjs().format('L @ HH:mm:ss.SSS');
		const format = `${chalk.dim('[' + timestamp + ']')} ${chalk.dim('[')}${this._tag}${chalk.dim(']')} ${level} ${chalk.dim('>')}  ${message}`;

		stream.write(format);
		stream.write('\n');
		if (meta) {
			switch (typeof meta) {
			case 'object':
				stream.write(JSON.stringify(meta, null, '\t'));
				break;
			default:
				stream.write(meta);
				break;
			}
		}
		stream.write('\n');
	}

	debug(message, meta = null) {
		if (isDebug()) {
			this._log(process.stdout, chalk.magenta('debug'), message, meta);
		}
	}

	info(message, meta = null) {
		this._log(process.stdout, chalk.green('info'), message, meta);
	}

	warn(message, meta = null) {
		this._log(process.stdout, chalk.yellow('warn'), message, meta);
	}

	error(message, meta = null) {
		this._log(process.stdout, chalk.red('error'), message, meta);
	}
}

/**
 * Creates a new Logger instance.
 *
 * @param {string} tag The tag to use as prefix.
 * @returns {Logger}
 */
module.exports = (tag) => new Logger(tag);
module.exports.Logger = Logger;
