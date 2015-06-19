var View = require( 'views/base/view' );

var PostMetaView = module.exports = View.extend({
	className: 'post-meta',

	// Probably put controls here...
	regions: {},

	template: require( './templates/post-meta' )
});
