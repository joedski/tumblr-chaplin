// Application routes.
module.exports = function( match ) {
	// Various flavors of blog rolls.
	match( '', 'home#index' );
	match( 'page/:page', 'home#index' );
	match( 'tagged/:tag', 'home#index' );

	// Permalink, with optional slug.
	match( 'post/:id', 'home#permalink' );
	match( 'post/:id/:slug', 'home#permalink' );

	// ... pages?
};
