// Require modules
const express = require('express');
const { Model } = require('mongoose');
const { Logger } = require('../logger');
const Mongo = require('../service/mongo');
const Scheduler = require('../service/scheduler');

/**
 * @param {express.Response} res
 * @param {Logger} logger
 * @param {any} error
 */
 const apiErrorHandler = (res, logger, error) => {
    if (! error) {
        res.status(500).send({ error: 'An error occured!'});
        return;
    }
    logger.error(error?.message ?? 'An error occured!', error);
    if (error.status) {
        res.status(error.status).send({ error: error.message });
    } else {
        res.json(error);
    }
};

const mapUserFilter = (userFilter) => {
	if (! userFilter) return {};

	const filter = {};

	/**
	 * @param {string} userFilterProp The name of the property supplied by the API call.
	 * @param {string} modelProp The property name as defined in the model.
	 */
	const check = (userFilterProp, modelProp = null, exact = true) => {
		if (! modelProp) {
			modelProp = userFilterProp;
		}

		const userProp = userFilter[userFilterProp];
		if (!! userProp) {
			if (exact) {
				filter[modelProp] = userProp;
			} else {
				filter[modelProp] = { $regex: userProp, $options: 'i' };
			}
		}
	}

	check('name', null, false);
	check('flags.isArchived');
	check('flags.isFork');
	check('flags.isMirror');
	check('flags.isPrivate');
	check('flags.isTemplate');
	check('language', 'primaryLanguage.name');
	check('license', 'license.name');

	return filter;
};

/**
 * @param {import('express').Application} app
 */
module.exports = app => {
    /** @type {import('awilix').AwilixContainer} */
    const container = app.get('container');

    /** @type {Logger} */
    const myLogger = container.resolve('createLogger')('ApiController');

    /** @type {(file: string, variables: object?) => Promise<import('@octokit/graphql/dist-types/types').GraphQlResponse<any>>} */
    const graphql = container.resolve('graphql');

    /** @type {Scheduler} */
    const scheduler = container.resolve('scheduler');

    /** @type {Mongo} */
    const mongo = container.resolve('mongo');

    /** @type {Model} */
    const Repository = mongo.getModel('Repository');

    const myRouter = express.Router();

    myRouter.post('/whoami', async (_req, res) => {
        try {
            const { viewer } = await graphql('user');
            res.json(viewer);
        } catch (error) {
            apiErrorHandler(res, myLogger, error);
        }
    });

	myRouter.post('/property/language', async (_req, res) => {
        const result = await Repository.distinct('primaryLanguage.name');
        res.json(result);
    });

    myRouter.post('/property/license', async (req, res) => {
		const filter = {
			'primaryLanguage.name': req.body.filter?.language
		};

        const result = await Repository.distinct('license.name', filter);
        res.json(result);
    });

    myRouter.post('/starred', async (req, res) => {
        try {
			const filter = mapUserFilter(req.body.filter);
			myLogger.debug('Filtering repositories by:', filter);

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
					skip: (page - 1) * perPage
				});
				if (req.body.sort?.enabled ?? false) {
					const sorter = {
						[req.body.sort.field]: req.body.sort.order
					};
					myLogger.debug('Sorting by:', sorter);
					query.sort(sorter);
				}
				return await query;
			}

			const result = await computeResult();
			res.json({
				isUpdating: await scheduler.isRunning('updateIndex'), // FIXME: not working
				pagination: {
					perPage, page, maxPage,
					hasPrev: page > 1,
					hasNext: page < maxPage
				},
				total: totalCount,
				data: result
			});
		} catch (error) {
			const msg = error?.message ?? 'An error occured!';
			myLogger.error(msg, error);
			res.status(500).json({ error: msg });
		}
    });

    app.use('/api', myRouter);
};
