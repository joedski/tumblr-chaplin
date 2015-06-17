var CollectionView = require( 'views/base/collection-view' );
var GetPostViewClass = require( 'views/post/get-post-view-class' );

module.exports = CollectionView.extend({
	template: require( './templates/post-collection' ),

	initItemView: function( model ) {
		if( this.getItemViewClass ) {
			var itemViewClass = this.getItemViewClass( model );
			return new itemViewClass({ model: model, autoRender: false });
		}
		else {
			return Chaplin.CollectionView.prototype.initItemView.apply( this, arguments );
		}
	},

	getItemViewClass: function( model ) {
		return GetPostViewClass.forModel( model );
	},
});
