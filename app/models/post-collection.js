var Collection = require( 'app/models/base/collection' );
var PostModel = require( './post-model' );

module.exports = Collection.extend({
	model: PostModel,
	comparator: function( a, b ) { return b.get( 'timestamp' ) - a.get( 'timestamp' ); }
});
