// Require modules
const { createController } = require('awilix-express');

const ApiController = require('../controller/ApiController');

module.exports = createController(ApiController)
	.prefix('/api')
	.post('/whoami', 'whoami')
	.post('/starred', 'fetchStarred')
	.post('/property/license', 'fetchLicenses')
	.post('/property/language', 'fetchLanguages');
