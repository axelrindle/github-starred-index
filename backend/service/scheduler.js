// Require modules
const { Agenda } = require('agenda');

class Scheduler {
	/**
	 * @param {object} cradle The awilix cradle proxy.
	 */
	constructor(cradle) {
		this._cradle = cradle;
		const { createLogger, mongo } = cradle;

		/** @type {import('../logger').Logger} */
		this._logger = createLogger('scheduler');

		/** @type {import('../service/mongo')} */
		this._mongodb = mongo;
	}

	/**
	 * Registers a new Job for execution.
	 *
	 * @param {string} name The job name.
	 * @param {string} interval An interval string.
	 * @param {boolean} immediate Whether to execute the job once immediately.
	 * @param {object?} data Any data to pass to the job.
	 * @param {object?} options Options for the job creation.
	 */
	async _registerJob(
		name,
		interval,
		immediate = false,
		data = null,
		options = {}
	) {
		this._agenda.define(name, async (_job) => {
			const handler = require(`../job/${name}.js`);
			handler(this._cradle); // FIXME: this is very ugly
		});
		if (immediate) {
			await this._agenda.now(name, data);
		}
		await this._agenda.every(interval, name, data, options);
	}

	async _loadJobs() {
		this._registerJob(
			'updateIndex',
			process.env.SCHEDULER_UPDATE_INDEX_INTERVAL,
			true
		);
		this._registerJob('cleanAgendaJobs', '0 0 1 */1 *');
	}

	async init() {
		this._agenda = new Agenda({
			mongo: this._mongodb.getClient().db(process.env.MONGO_DB),
		});
		this._agenda.on('error', (err) => {
			this._logger.error(err?.message ?? 'An error occured!', err);
		});

		this._loadJobs();

		await this._agenda.start();
		this._logger.info('Scheduler initialized.');
	}

	async dispose() {
		await this._agenda.stop();
		this._logger.info('Scheduler stopped.');
	}

	async isRunning(name) {
		const result = await this._agenda.jobs({ name }, { name: -1 }, 1, 0);
		if (result.length == 0) {
			return false;
		} else {
			const job = result[0];
			return job.isRunning();
		}
	}

	getAgenda() {
		return this._agenda;
	}
}

module.exports = Scheduler;
