// Require modules
const dayjs = require('dayjs');

/**
 * Cleans the agendaJobs collection by removing entries older than 7 days.
 *
 * @param {object} param0
 * @param {(tag: string) => import('../logger').Logger} param0.createLogger
 * @param {import('../service/mongo')} param0.mongo
 */
module.exports = async ({ createLogger, mongo }) => {
	/** @type {import('../logger').Logger} */
	const myLogger = createLogger('job cleanAgendaJobs');

	const collection = mongo.getCollection('agendaJobs');
	const oldEntries = collection.find({
		lastRunAt: { $lt: dayjs().subtract(7, 'day').toDate() },
	});

	myLogger.info('Cleaning old job entries...');

	let counter = 0;
	while (await oldEntries.hasNext()) {
		counter++;
		const next = await oldEntries.next();
		await collection.deleteOne({ _id: next._id });
	}

	myLogger.info(`Done. Removed ${counter} entries.`);
};
