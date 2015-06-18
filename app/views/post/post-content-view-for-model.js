var postViewTypeMap = {
	'*': require( 'views/post/post-content/test-post-content-view' ),
	'text': require( 'views/post/post-content/text-post-content-view' ),
	'quote': require( 'views/post/post-content/quote-post-content-view' ),
	'link': require( 'views/post/post-content/link-post-content-view' ),
	'answer': require( 'views/post/post-content/answer-post-content-view' ),
	'video': require( 'views/post/post-content/video-post-content-view' ),
	// 'audio': require( 'views/post/post-content/audio-post-content-view' ),
	'photo': require( 'views/post/post-content/photo-post-content-view' ),
	'chat': require( 'views/post/post-content/chat-post-content-view' )
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
