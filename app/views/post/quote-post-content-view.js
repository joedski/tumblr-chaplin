var PostView = require( './post-view' );

module.exports = PostView.extend({
	className: 'post-content quote-post-content',
	template: require( './templates/quote-post-content' ),
});
