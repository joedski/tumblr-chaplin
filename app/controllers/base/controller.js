var SiteView = require('views/site-view');

module.exports = Chaplin.Controller.extend({
    // Compositions persist stuff between controllers.
    // You may also persist models etc.
    beforeAction: function() {
    	// Learning note: Apparently whatever one doesn't specify a region to go into is the one that the compose uses to provide the regions used for other views.
        this.reuse( 'site', SiteView );
    }
});