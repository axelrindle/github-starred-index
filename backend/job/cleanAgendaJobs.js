// Require modules
const dayjs = require('dayjs');
const MongoDB = require('../service/mongo');
const { Logger } = require('../logger');

/**
 * Cleans the agendaJobs collection by removing entries older than 7 days.
 *
 * @param {object} param0
 * @param {(tag: string) => Logger} param0.createLogger
 * @param {MongoDB} param0.mongo
 */
module.exports = async ({ createLogger, mongo }) => {
	/** @type {Logger} */
    const myLogger = createLogger('job cleanAgendaJobs');

	const collection = mongo.getCollection('agendaJobs');
	const oldEntries = collection.find({
		"lastRunAt": { $lt: dayjs().subtract(7, 'day').toDate() }
	});

	myLogger.info('Cleaning old job entries...');

	let counter = 0;
	while (await oldEntries.hasNext()) {
		counter++;
		const next = await oldEntries.next();
		await collection.deleteOne({ '_id': next._id });
	}

	myLogger.info(`Done. Removed ${counter} entries.`);
}
