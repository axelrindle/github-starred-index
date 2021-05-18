module.exports = class Controller {

	constructor({ createLogger }) {
		this._logger = createLogger(this.constructor.name);
	}

};
