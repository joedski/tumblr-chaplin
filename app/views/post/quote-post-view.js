var PostView = require( './post-view' );

module.exports = PostView.extend({
	className: 'post post-quote',
	template: require( './templates/quote-post' ),
	regions: {},
});
