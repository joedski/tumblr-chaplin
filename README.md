Tumblr Chaplin Base
===================

This is a Tumblr theme which uses Chaplin to add dynamic functionality, allowing for themes with complex interaction, as well as complex ways to shoot yourself in the foot.



Road Map
--------

### Basic Functionality

Obviously.

#### Obviously what?

- Grab demo data from Tumblr's API page to stub in Models.
	- Will be loading purely locally, although this is technically not using their example API key for evil, which is the thing they state you can't use it for.
- Get Blog Roll working.
	- This means getting each Post view working, which is just templates by default.
- Get Separate Permalink View working.
- Get Filtered Blog Rolls working. (post type, tagged...)
- Infinite Scrolling.
	- Pagination of continuous scrolling should defer to HTML.  I mean, Tumblr doesn't really work without JS, nor does a lot of the web, but it'd be nice.  (Also pagination is the only way to know how many posts per page the blog owner wants loading.)
- Actually get a real API key to consume real data.
	- Set up thing to use special file if loading from localhost, but use blog URL if loading on tumblr.

### Basic UX Optimization

- It is preferable that a post with images have all the images load before it shows.  At least, the small sized images.  the 500px ones I guess?
	- That is, the post view should have an initial look, and a 'content loaded' look.  In some cases, the former may be "still hidden", while in others it may actually pop up with a loading animation, and in either case a transition occurs when the post itself actually is display ready.
- Save already loaded post models to reduce requests if the user goes from, say, `/` to `/post/12345` to `/tagged/herp-derp-tag`, and the like, or at least pre-show some content while loading the first page or two.
	- Need to keep separate track of progress through pages for each tag and index, of course...
	- Also, provisions for custom filters that aren't directly supported by just post types and single tags.
	- Basically, the models are given to the controller through a service which produces the correct "view"/slice into the raw data.

### Modernizr to Dynamically Load/Execute Polyfills

> Note: Tumblr themselves officially support only versions 9+ of IE, so while IE8 may be nice, it and older versions will only supported in as much as prefabbed code can be found for them.  No custom consideration will be given to IE8 and older.

> Note: Not positively sure how this will work, given Tumblr's need to static-ify theme assets.  Given they are prefabbed code chunks, it may do to upload them only once and never touch them again, much like how jQuery is typically loaded across themes.

Refer to [Modernizr's Handy Dandy List](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills) for polyfills to use.  Current polyfills of interest:

- *(IE8, 9; Some old FF)* [classList.js](https://github.com/eligrey/classList.js) to add jQueryless class toggling.
- *(IE8, 9; Lots of others)* [dom4](https://github.com/WebReflection/dom4) might be better than just *classList.js*.
	- Note that for this, *IE8* needs to also load their [ie8 library](https://github.com/WebReflection/ie8) which includes many other things modern browsers have.
