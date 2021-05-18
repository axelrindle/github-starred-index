// Require modules
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const mongoose = require('mongoose');
const isDebug = require('../util/isDebug');

class Mongo {
	constructor({ createLogger, eventbus }) {
		/** @type {import('../logger').Logger} */
		this._logger = createLogger('mongodb');

		/** @type {NodeJS.EventEmitter} */
		this._eventbus = eventbus;
	}

	async _loadModels() {
		const directory = path.join(__dirname, '..', 'model');
		const list = (await fs.readdir(directory)).map((el) =>
			el.replace('.js', '')
		);

		for (const model of list) {
			mongoose.model(model, require(path.join(directory, model)));
		}

		this._logger.debug(`Loaded ${list.length} model(s).`);
	}

	async _connect() {
		this._logger.info('Connecting...');
		await mongoose.connect(process.env.MONGO_URI, {
			authSource: 'admin',
			autoIndex: isDebug(),
			useCreateIndex: true, // https://mongoosejs.com/docs/deprecations.html#ensureindex
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		this._logger.info('Successfully connected.');

		mongoose.connection.on('error', (err) => {
			this._logger.error(err.message);
		});
		mongoose.connection.on('reconnected', () => {
			this._logger.info('Successfully reconnected to the database.');
		});
		mongoose.connection.on('reconnectFailed', () => {
			this._logger.error('Failed to reconnect to the database!');
			this._eventbus.emit('shutdown');
		});

		if (isDebug) {
			mongoose.set('debug', (collection, method, ...args) => {
				const argString = args
					.map((el) => JSON.stringify(el))
					.join(', ');
				this._logger.debug(
					`Query fired: ${chalk.underline(
						`${collection}.${method}(${argString})`
					)}`
				);
			});
		}
	}

	async init() {
		await this._loadModels();
		await this._connect();
	}

	async dispose() {
		await mongoose.disconnect();
		this._logger.info('Disposed.');
	}

	/**
	 * Retrieves a Model based on it's name.
	 *
	 * @param {string} name The model name.
	 * @returns {mongoose.Model|null}
	 */
	getModel(name) {
		try {
			return mongoose.model(name);
		} catch (error) {
			if (error instanceof mongoose.Error.MissingSchemaError) {
				return null;
			} else {
				throw error;
			}
		}
	}

	/**
	 * Retrieves the client instance.
	 *
	 * @returns {import('mongodb').MongoClient}
	 */
	getClient() {
		return mongoose.connection.getClient();
	}

	/**
	 * Retrieves a collection or creates it.
	 *
	 * @param {string} name
	 * @returns {mongoose.Collection}
	 */
	getCollection(name) {
		return mongoose.connection.collection(name);
	}
}

module.exports = Mongo;
