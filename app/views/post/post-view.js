var View = require( 'views/base/view' );
var PostMetaView = require( './post-meta-view' );

var PostView = module.exports = View.extend({
	className: 'post',

	regions: {
		'body': '.post-body',
		'meta': '.post-meta'
	},

	template: require( './templates/post' ),

	// template: function switchTemplate() {
	// 	var type = this.model ? this.model.get( 'type' ) : '' || '';
	// 	var templateFunction;

	// 	try {
	// 		templateFunction = require( './templates/' + type + '-post' );
	// 	}
	// 	catch( error ) {
	// 		templateFunction = require( './templates/post' );
	// 	}

	// 	return templateFunction.apply( this, arguments );
	// },

	render: function() {
		View.prototype.render.apply( this, arguments );

		this.subview( 'meta', new PostMetaView({
			model: this.model,
			container: this.$( this.regions.meta )
		}));
	},
});