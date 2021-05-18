// Require modules
const Controller = require('./Controller');

module.exports = class ApiController extends Controller {

	constructor({ createLogger, graphql, mongo, scheduler }) {
		super({ createLogger });

		/** @type {(file: string, variables: object?) => Promise<import('@octokit/graphql/dist-types/types').GraphQlResponse<any>>} */
		this._graphql = graphql;

		/** @type {import('../service/mongo')} */
		this._mongo = mongo;

		/** @type {import('../service/scheduler')} */
		this._scheduler = scheduler;
	}

	/**
	 * @param {express.Response} res
	 * @param {any} error
	 */
	_apiErrorHandler(res, error) {
		if (!error) {
			res.status(500).send({ error: 'An error occured!' });
			return;
		}
		this._logger.error(error?.message ?? 'An error occured!', error);
		if (error.status) {
			res.status(error.status).send({ error: error.message });
		} else {
			res.json(error);
		}
	}

	_mapUserFilter(userFilter) {
		if (!userFilter) return {};

		const filter = {};

		/**
		 * @param {string} userFilterProp The name of the property supplied by the API call.
		 * @param {string} modelProp The property name as defined in the model.
		 */
		const check = (userFilterProp, modelProp = null, exact = true) => {
			if (!modelProp) {
				modelProp = userFilterProp;
			}

			const userProp = userFilter[userFilterProp];
			if (userProp) {
				if (exact) {
					filter[modelProp] = userProp;
				} else {
					filter[modelProp] = { $regex: userProp, $options: 'i' };
				}
			}
		};

		check('name', null, false);
		check('flags.isArchived');
		check('flags.isFork');
		check('flags.isMirror');
		check('flags.isPrivate');
		check('flags.isTemplate');
		check('language', 'primaryLanguage.name');
		check('license', 'license.name');

		return filter;
	}

	/**
	 * Queries for user information.
	 *
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 */
	async whoami(req, res) {
		try {
			const { viewer } = await this._graphql('user');
			res.json(viewer);
		} catch (error) {
			this._apiErrorHandler(res, error);
		}
	}

	async fetchLanguages(req, res) {
		/** @type {import('mongoose').Model} */
		const Repository = this._mongo.getModel('Repository');

		const result = await Repository.distinct('primaryLanguage.name');
		res.json(result);
	}

	async fetchLicenses(req, res) {
		/** @type {import('mongoose').Model} */
		const Repository = this._mongo.getModel('Repository');

		const filter = {
			'primaryLanguage.name': req.body.filter?.language,
		};

		const result = await Repository.distinct('license.name', filter);
		res.json(result);
	}

	async fetchStarred(req, res) {
		/** @type {import('mongoose').Model} */
		const Repository = this._mongo.getModel('Repository');

		try {
			const filter = this._mapUserFilter(req.body.filter);
			this._logger.debug('Filtering repositories by:', filter);

			const totalCount = await Repository.countDocuments(filter);
			const perPage = parseInt(req.body.perPage) || totalCount;
			const maxPage = Math.ceil(totalCount / perPage) || 1;
			let page = parseInt(req.body.page) || 1;
			if (page < 1) {
				page = 1;
			}
			if (page > maxPage) {
				page = maxPage;
			}

			/**
			 * @returns {Promise<Array<Repository>>}
			 */
			async function computeResult() {
				/** @type {import('mongoose').QueryWithHelpers<Array<Repository>, Repository>} */
				const query = Repository.find(filter, null, {
					limit: perPage,
					skip: (page - 1) * perPage,
				});
				if (req.body.sort?.enabled ?? false) {
					const sorter = {
						[req.body.sort.field]: req.body.sort.order,
					};
					this._logger.debug('Sorting by:', sorter);
					query.sort(sorter);
				}
				return await query;
			}

			const result = await computeResult();
			res.json({
				isUpdating: await this._scheduler.isRunning('updateIndex'), // FIXME: not working
				pagination: {
					perPage,
					page,
					maxPage,
					hasPrev: page > 1,
					hasNext: page < maxPage,
				},
				total: totalCount,
				data: result,
			});
		} catch (error) {
			const msg = error?.message ?? 'An error occured!';
			this._logger.error(msg, error);
			res.status(500).json({ error: msg });
		}
	}

};
