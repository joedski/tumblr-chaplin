var mediator = require( 'mediator' );
var testFixture = require( 'test-fixture' );
var PostCollection = require( 'models/post-collection' );
// eventually, BlogModel...

// The application object.
module.exports = Application = Chaplin.Application.extend({
    start: function() {
        // You can fetch some data here and start app
        // (by calling `super`) after that.
        // mediator.postCollection.fetch();
        // mediator.postCollection.

        this.constructor.__super__.start.call(this);
    },

    initMediator: function() {
        mediator.postCollection = new PostCollection();
        mediator.postCollection.add( testFixture.getPage( 0 ).response.posts );

        this.constructor.__super__.initMediator.apply(this, arguments);
    },
});