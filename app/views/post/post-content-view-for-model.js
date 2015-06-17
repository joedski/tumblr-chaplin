var postViewTypeMap = {
	'*': require( 'app/views/post/post-view' ),
	// 'text': require( 'app/views/post/text-post-view' ),
	// 'quote': require( 'app/views/post/quote-post-view' ),
	// 'link': require( 'app/views/post/link-post-view' ),
	// 'answer': require( 'app/views/post/answer-post-view' ),
	// 'video': require( 'app/views/post/video-post-view' ),
	// 'audio': require( 'app/views/post/audio-post-view' ),
	// 'photo': require( 'app/views/post/photo-post-view' ),
	// 'chat': require( 'app/views/post/chat-post-view' )
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
