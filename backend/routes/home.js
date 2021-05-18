// Require modules
const { createController } = require('awilix-express');

const HomeController = require('../controller/HomeController');

module.exports = createController(HomeController)
	.get('/', 'index');
