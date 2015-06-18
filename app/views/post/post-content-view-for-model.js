var postViewTypeMap = {
	'*': require( 'views/post/test-post-content-view' ),
	'text': require( 'views/post/text-post-content-view' ),
	'quote': require( 'views/post/quote-post-content-view' ),
	// 'link': require( 'views/post/link-post-content-view' ),
	// 'answer': require( 'views/post/answer-post-content-view' ),
	// 'video': require( 'views/post/video-post-content-view' ),
	// 'audio': require( 'views/post/audio-post-content-view' ),
	'photo': require( 'views/post/photo-post-content-view' ),
	// 'chat': require( 'views/post/chat-post-content-view' )
};

module.exports = function postContentViewForModel( model ) {
	var postType = model.get( 'type' );
	var postViewClass = postViewTypeMap[ postType ];

	if( ! postViewClass ) {
		console.warn( "Unknown post type '" + postType + "'.  Returning default PostContentView." );

		return postViewTypeMap[ '*' ];
	}

	return postViewClass;
};
