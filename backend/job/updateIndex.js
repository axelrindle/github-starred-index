function mapNodeToRepository(node) {
	return {
		identifier: `${node.owner.login}/${node.name}`,
		starredAt: node.starredAt,
		name: node.name,
		description: node.description,
		owner: node.owner,
		url: node.url,
		openGraphImageUrl: node.openGraphImageUrl,
		license: node.licenseInfo,
		primaryLanguage: node.primaryLanguage,
		flags: {
			isArchived: node.isArchived,
			isFork: node.isFork,
			isMirror: node.isMirror,
			isPrivate: node.isPrivate,
			isTemplate: node.isTemplate,
		},
	};
}

/**
 * @param {import('mongoose').Model} model
 * @param {object[]} docs
 */
async function upsertMany(model, docs) {
	const alreadyInDb = await model.find({
		identifier: { $in: docs.map((el) => el.identifier) },
	});
	const alreadyInDbNames = alreadyInDb.map((el) => el.identifier);
	const notInDbYet = docs.filter(
		(el) => !alreadyInDbNames.includes(el.identifier)
	);

	if (notInDbYet.length > 0) {
		await model.insertMany(notInDbYet);
	}

	const toUpdate = [];
	for (const alreadyInDbDoc of alreadyInDb) {
		const newDoc = docs.find(
			(el) => el.identifier === alreadyInDbDoc.identifier
		);
		toUpdate.push(
			model.updateOne({ identifier: alreadyInDbDoc.identifier }, newDoc)
		);
	}
	await Promise.all(toUpdate);
}

/**
 * @param {object} param0
 * @param {(tag: string) => import('../logger').Logger} param0.createLogger
 * @param {import('../service/graphql').GraphQLHandler} param0.graphql
 * @param {import('../service/mongo')} param0.mongo
 */
module.exports = async ({ createLogger, graphql, mongo }) => {
	/** @type {import('../logger').Logger} */
	const myLogger = createLogger('job updateIndex');

	/** @type {import('mongoose').Model} */
	const Repository = mongo.getModel('Repository');

	try {
		const countResult = await graphql('starredRepositoriesCount');
		const totalCount = countResult.viewer.starredRepositories.totalCount;
		myLogger.info(`Loading ${totalCount} entries...`);

		const nameList = [];
		const toSave = [];
		let hasNext = false;
		let lastEndCursor = null;
		let page = 0;
		do {
			const queryResult = await graphql('starredRepositories', {
				after: lastEndCursor,
			});
			const { pageInfo, edges } = queryResult.viewer.starredRepositories;

			const nodes = edges.map((edge) => ({
				starredAt: edge.starredAt,
				...edge.node,
			}));
			const nodesMapped = nodes.map(mapNodeToRepository);
			nameList.push(...nodesMapped.map((el) => el.identifier));
			toSave.push(upsertMany(Repository, nodesMapped));

			myLogger.debug(`Page ${++page}`);

			hasNext = pageInfo.hasNextPage;
			lastEndCursor = pageInfo.endCursor;
		} while (hasNext);

		await Promise.all(toSave);

		const orphaned = await Repository.find(
			{ identifier: { $nin: nameList } },
			'identifier'
		);
		if (orphaned.length > 0) {
			myLogger.info(`Deleting ${orphaned.length} orphaned entries...`);
			await Repository.deleteMany({
				identifier: { $in: orphaned.map((el) => el.identifier) },
			});
		}

		myLogger.info(`Done processing ${totalCount} entries.`);
	} catch (error) {
		myLogger.error(error?.message ?? 'An error occured!', error);
	}
};
