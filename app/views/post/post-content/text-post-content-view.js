var View = require( 'views/base/view' );

module.exports = View.extend({
	className: 'post-content text-post-content',
	template: require( './templates/text-post-content' ),
});
