var CollectionView = require( 'views/base/collection-view' );
var PostView = require( 'views/post/post-view' );

module.exports = CollectionView.extend({
	template: require( './templates/post-collection' ),
	itemView: PostView,
	listSelector: '.post-collection-list'
});
