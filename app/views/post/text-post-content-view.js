var PostView = require( './post-view' );

module.exports = PostView.extend({
	className: 'post-content text-post-content',
	template: require( './templates/text-post-content' ),
});
