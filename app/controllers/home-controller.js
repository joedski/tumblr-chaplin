var Controller = require('controllers/base/controller');
var HeaderView = require('views/home/header-view');
var HomePageView = require('views/home/home-page-view');
var YayPageView = require('views/yay/yay-page-view');

module.exports = Controller.extend({
    beforeAction: function() {
        this.constructor.__super__.beforeAction.apply(this, arguments);
        this.reuse('header', HeaderView, {
            region: 'header'
        });
    },

    index: function() {
        this.view = new HomePageView({
            region: 'main'
        });
    },

    yay: function() {
    	this.view = new YayPageView({
    		region: 'main'
    	});
    }
});