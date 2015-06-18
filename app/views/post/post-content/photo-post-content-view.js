var View = require( 'views/base/view' );

module.exports = View.extend({
	className: 'post-content photo-post-content',
	template: require( './templates/photo-post-content' ),
	getTemplateData: function() {
		// Here's an example of pre-processing attributes.
		// Note that when modifying attributes, always clone the object.
		// In this example, this is done by using underscore's defaults function.

		var attributes = this.model.attributes;

		// Prefabbed sizes include: 1280, 500, 400, 250, 100, and 75 (square)
		// TODO: Move blogrollSizeWidth out to some general blog settings thing.  Probably on mediator.
		var blogrollSizeWidth = 500;

		return _.defaults({
			photos: _.map( attributes.photos, function addBlogrollSize( photoAttrs ) {
				return _.defaults({
					// If there is a 500px wide size, pick that.
					// Otherwise, pick the largest size not wider than 500px.
					"blogroll_size":
						_.find( photoAttrs.alt_sizes, function find500pxWide( size ) { return size.width == blogrollSizeWidth; })
						|| (function normalizeSize( size ) {
							var aspectRatio = size.width / size.height;
							return _.defaults({
								width: blogrollSizeWidth,
								height: blogrollSizeWidth / aspectRatio
							}, size );
						}( _.chain( photoAttrs.alt_sizes )
							.filter( function( size ) { return size.width <= blogrollSizeWidth })
							.reduce( function( largestSize, size ) { if( size.width > largestSize.width ) return size; else return largestSize; })
							// Note: Lodash automatically unwraps values when a function returns a "scalar" (single value) rather than a collection.  reduce and reduceRight are examples of such functions.
						))
				}, photoAttrs );
			})
		}, attributes );
	},
});
