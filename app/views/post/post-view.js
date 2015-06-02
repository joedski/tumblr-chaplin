var View = require( 'views/base/view' );

var PostView = module.exports = View.extend({
	className: 'post',
	regions: {},

	template: function switchTemplate() {
		var type = this.model ? this.model.get( 'type' ) : '' || '';
		var templateFunction;

		try {
			templateFunction = require( './templates/' + type + '-post-view' );
		}
		catch( error ) {
			templateFunction = require( './templates/post-view' );
		}

		return templateFunction.apply( this, arguments );
	},
});