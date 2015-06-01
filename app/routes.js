// Application routes.
module.exports = function( match ) {
  match( '', 'home#index' );
  match( 'yay', 'home#yay' );
};
