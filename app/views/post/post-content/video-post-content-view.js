var View = require( 'views/base/view' );

module.exports = View.extend({
	className: 'post-content video-post-content',
	template: require( './templates/video-post-content' ),
	getTemplateData: function() {
		var attributes = this.model.attributes;

		// TODO: Move blogrollSizeWidth out to some general blog settings thing.  Probably on mediator.
		var blogrollSizeWidth = 500;

		return _.defaults({
			"player_blogroll_size":
				// NOTE: Player embed sizes only have the width specified.  Height is not explicitly defined.
				_.find( attributes.player, function find500pxWide( size ) { return size.width == blogrollSizeWidth; })
				|| _.chain( photoAttrs.alt_sizes )
					.filter( function( size ) { return size.width <= blogrollSizeWidth })
					.reduce( function( largestSize, size ) { if( size.width > largestSize.width ) return size; else return largestSize; })
					// Note: Lodash automatically unwraps values when a function returns a "scalar" (single value) rather than a collection.  reduce and reduceRight are examples of such functions.
		}, attributes );
	},
});
