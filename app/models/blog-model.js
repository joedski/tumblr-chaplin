var Model = require( 'models/base/model' );

module.exports = Model.extend({
	defaults: {
		"name": "",
		"title": "",
		"description": ""
	}
});
