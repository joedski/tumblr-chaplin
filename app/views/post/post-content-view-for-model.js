var postViewTypeMap = {
	'*': require( 'app/views/post/test-post-content-view' ),
	// 'text': require( 'app/views/post/text-post-content-view' ),
	// 'quote': require( 'app/views/post/quote-post-content-view' ),
	// 'link': require( 'app/views/post/link-post-content-view' ),
	// 'answer': require( 'app/views/post/answer-post-content-view' ),
	// 'video': require( 'app/views/post/video-post-content-view' ),
	// 'audio': require( 'app/views/post/audio-post-content-view' ),
	// 'photo': require( 'app/views/post/photo-post-content-view' ),
	// 'chat': require( 'app/views/post/chat-post-content-view' )
};

module.exports = function postContentViewForModel( model ) {
	var postType = model.get( 'type' );
	var postViewClass = postViewTypeMap[ postType ];

	if( ! postViewClass ) {
		console.error( "Unknown post type '" + postType + "'.  Returning default PostView." );

		// throw new Error( "Unknown post type '" + postType + "'.  Returning default PostView." );
		return postViewTypeMap[ '*' ];
	}

	return postViewClass;
};
