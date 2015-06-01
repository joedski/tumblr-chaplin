Tumblr Chaplin Base
===================

This is a Tumblr theme which uses Chaplin to add dynamic functionality, allowing for themes with complex interaction, as well as complex ways to shoot yourself in the foot.



Road Map
--------

### Basic Functionality

Obviously.

### Modernizr to Dynamically Load/Execute Polyfills

> Note: Tumblr themselves officially support only versions 9+ of IE, so while IE8 may be nice, it and older versions will only supported in as much as prefabbed code can be found for them.  No custom consideration will be given to IE8 and older.

> Note: Not positively sure how this will work, given Tumblr's need to static-ify theme assets.  Given they are prefabbed code chunks, it may do to upload them only once and never touch them again, much like how jQuery is typically loaded across themes.

Refer to [Modernizr's Handy Dandy List](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills) for polyfills to use.  Current polyfills of interest:

- *(IE8, 9; Some old FF)* [classList.js](https://github.com/eligrey/classList.js) to add jQueryless class toggling.
- *(IE8, 9; Lots of others)* [dom4](https://github.com/WebReflection/dom4) might be better than just *classList.js*.
	- Note that for this, *IE8* needs to also load their [ie8 library](https://github.com/WebReflection/ie8) which includes many other things modern browsers have.
