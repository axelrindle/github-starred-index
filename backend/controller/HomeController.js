// Require modules
const Controller = require('./Controller');

module.exports = class HomeController extends Controller {

	/**
	 * @param {import('express').Request} _req
	 * @param {import('express').Response} res
	 */
	async index(_req, res) {
		res.render('index');
	}

};
