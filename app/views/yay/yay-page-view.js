var View = require( 'views/base/view' );

module.exports = View.extend({
	autoRender: true,
	className: 'yay-page home-page',
	template: require( './templates/yay' )
});
