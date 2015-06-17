var postViewTypeMap = {
	'*': require( './post-view' ),
	// 'text': require( './text-post-view' ),
	// 'quote': require( './quote-post-view' ),
	// 'link': require( './link-post-view' ),
	// 'answer': require( './answer-post-view' ),
	// 'video': require( './video-post-view' ),
	// 'audio': require( './audio-post-view' ),
	// 'photo': require( './photo-post-view' ),
	// 'chat': require( './chat-post-view' )
};

module.exports = function postViewForModel( model ) {
	var postType = model.get( 'type' );
	var postViewClass = postViewTypeMap[ postType ];

	if( ! postViewClass ) {
		console.warn( "Unknown post type '" + postType + "'.  Returning default PostView." );

		return postViewTypeMap[ '*' ];
	}

	return postViewClass;
};
