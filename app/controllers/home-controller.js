var mediator = require( 'mediator' );
var Controller = require('controllers/base/controller');
var HeaderView = require('views/home/header-view');
var PostCollectionView = require( 'views/post-collection/post-collection-view' );

module.exports = Controller.extend({
    beforeAction: function() {
        this.constructor.__super__.beforeAction.apply(this, arguments);
        this.reuse( 'header', HeaderView, {
            region: 'header'
        });
    },

    blogRoll: function( parameters ) {
        console.log( 'home#blogRoll received', parameters );

        this.view = new PostCollectionView({
            collection: mediator.postCollection,
            region: 'blogRoll'
        });
    },
});