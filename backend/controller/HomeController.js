// Require modules
const Controller = require('./Controller');

module.exports = class HomeController extends Controller {

	constructor({ createLogger, graphql }) {
		super({ createLogger });

		/** @type {(file: string, variables: object?) => Promise<import('@octokit/graphql/dist-types/types').GraphQlResponse<any>>} */
		this._graphql = graphql;
	}

	/**
	 * @param {import('express').Request} _req
	 * @param {import('express').Response} res
	 */
	async index(_req, res) {
		const { viewer } = await this._graphql('user');
		res.render('index', {
			user: viewer
		});
	}
};
