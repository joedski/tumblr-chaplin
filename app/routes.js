// Application routes.
module.exports = function( match ) {
	// Various flavors of blog rolls.
	match( '', 'home#blogRoll' );
	// This is the exact same as above, but starting at/going to a specific page.
	match( 'page/:page', 'home#blogRoll' );
	match( 'tagged/:tag', 'home#blogRoll' );
	// same as page/:page, but for tagged rolls.
	match( 'tagged/:tag/page/:page', 'home#blogRoll' );

	// Permalink, with optional slug.
	match( 'post/:id', 'post#permalink' );
	match( 'post/:id/:slug', 'post#permalink' );

	// ... pages?
};
