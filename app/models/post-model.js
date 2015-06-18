var Model = require( 'models/base/model' );

module.exports = Model.extend({
	defaults: {
		"id": 0,
		"blog_name": '', // hopefully this is the same as the blog named in the current BlogModel...
		"post_url": '', // permalink.
		"short_url": '',
		"slug": '', // "friendly" name.
		"type": '', // one of: text, quote, link, answer, video, audio, photo (may be a photo or photoset), chat
		"date": '', // friendly time.
		"timestamp": 0,
		"state": '', // always "published" for us.
		"format": '', // "html"|"markdown"
		"reblog_key": '', // Would only be used when using API:/post/reblog (Is used in various other places, sometimes...)
		"tags": [], // array<string>
		"note_count": 0 // thankfully, included even when notes_info is not 'true'.

		// Other general props:
		// - bookmarklet: true if was created using the Tumblr Bookmarklet.
		// - mobile: true if was created using the Tumblr Mobile App or email publishing.
		// - source_url: Used for reblogs, quotes, or other things with sources, omitted if not present.
		// - source_title: Title of thing at source_url, omitted if not present.
		// - liked: Boolean, Whether the post is liked or not.  Only exists if request is full OAuthed request.
		// 
		// Other: Reblog Props:
		// Note: These seem to be here even if reblog_info is not true,
		// so perhaps passing reblog_info=true actually means
		// to retrieve all reblog info rather than just the last source.
		// This might be the case, given that `trail` is an array.
		// There might also be additional items returned.  I dunno.
		// (maybe this app key just alawys returns reblog info...?)
		// - reblog: {} | null, // only non-null if this post is reblogged.
		//     - tree_html: '' // the combined HTML of all the previous reblogs of this post.
		//     - comment: '' // comment made by the person who made this particular reblog of the post.
		// - trail: [{}] | null, // ???
		//     - blog: {} // the last blog that blogged this.
		//         - name: '' // the name of the blog
		//         - theme: '' // The standard theme vars for this blog.
		//     - post: {} // info about the previous post.
		//         - id: '' // for some reason, the ID is a string here... ???
		//     - content: '' // HTML content...
		//     - content_raw: '' // ...?  Unfiltered?  (Might contain markdown if they used that?)
		//     - is_root_item: Boolean // Whether or not this is the root trail item.
		//     - is_current_item: Boolean // ???

		// Reblog Info: reblog_info=true
		// - reblogged_from_id '' // these are strings for some reason...
		// - reblogged_from_url '' // URL of originating post
		// - reblogged_from_name ''
		// - reblogged_from_title ''
		// - reblogged_root_id '' // these are strings for some reason...
		// - reblogged_root_url '' // URL of root originating post
		// - reblogged_root_name ''
		// - reblogged_root_title ''

		// Notes Info: notes_info=true
		// Note: Allegedly, Tumblr limits the notes returned here to the most recent 50,
		// although in one test I did I got 49.  Close enough.  Either way,
		// Tumblr doesn't load all the notes.  This is fine, prevents a fire hose, but
		// it seems to prevent other parties from letting users scroll all the notes if they so wish.
		// - notes: [{}]
		//     - timestamp: '' // String...?
		//     - blog_name: ''
		//     - blog_url: ''
		//     - type: '' // one of 'reblog', 'like'.
		//     - post_id: '' // string...?  Only present if type:'reblog'.
		//     - added_text: '' // Only present if type:'reblog'.

		// Text posts:
		// - title: ''
		// - body: '' // may be in a certain format as specified in the "format" property.

		// Photo posts:
		// Note: If a Photo post is a Photoset, then the "photos" property will have more than 1 object in it.
		// Otherwise, it will have only 1 object.
		// - caption: '',
		// - image_permalink: '',
		// - photos: [],
		// - highlighted: [], // ???
		// - photoset_layout: '' // Present if this is a photoset.  A string of number which indicates the number of photos on a given row.
		//     - Example: '11211' indicates that the first two rows have 1 photo each, the third row has 2 photos across it, and the last to rows have 1 photo each, for a total of 6 photos.
		// 
		// Photo Objects have the following properties:
		//     - caption: ''
		//     - alt_sizes: []
		//         // Prefabbed widths include: 1280, 500, 400, 250, 100, and 75 (square)
		//         - width: 0 // Note that the size is either a certain width, or a width smaller than that certain width.
		//         - height: 0
		//         - url: ''
		//     - original_size:
		//         - (Same props as the objects in `alt_sizes`.)

		// Quote posts:
		// - source_url: '' - See "Other general props"
		// - source_title: '' - See "Other general props"
		// - text: '' - The text of the quote.  May contain HTML or markdown.
		// - source: '' - Source/Attribution of the quote.  May contain HTML or markdown. (does Tumblr ever pass through raw markdown if you don't explicitly ask?  I assume no...)

		// Link posts:
		// - title: ''
		// - url: ''
		// - author: '' - The author of the linked to item, for example if it's an article.
		// - publisher: '' - Publisher of the linked to item.
		// - excerpt: ''
		// - description: '' - User supplied description of linked to item.
		// - photos: [] - Photo Objects.  See the above section titled as such, under "Photo posts".

		// Chat Posts:
		// - title: '' | null - Optional.  Probably all titles are optional, but this one was noted to be in the API reference.
		// - body: '' - The full body of chat text.  Lines are separated by \n.
		// - dialogue: [] - the 'ue' is indeed in the property name.  
		//     - label: '' - The label representing the speaker.  Usually "{name}:"
		//     - name: '' - The name of the speaker.
		//     - phrase: '' - The elocution.

		// Audio posts:
		// - caption: ''
		// - player: '' - HTML to embed the player.
		// - plays: 0 - Times the post has been played.
		// 
		// Extra properties pulled from ID3 tags:
		// - album_art: ''
		// - artist: ''
		// - album: ''
		// - track_name: ''
		// - track_number: 0
		// - year: 0

		// Video posts:
		// - caption: ''
		// - thumbnail_url: ''
		// - thumbnail_width: 0
		// - thumbnail_height: 0
		// - player: []
		//     - width: 0
		//     - embed_code: '' - Exact code varies by source, but since the width is present, it should be scalable.

		// Answer posts:
		// - asking_name: ''
		// - asking_url: ''
		// - question: ''
		// - answer: ''

	}
});
