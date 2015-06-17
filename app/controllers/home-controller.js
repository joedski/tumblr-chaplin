var Controller = require('controllers/base/controller');
var HeaderView = require('views/home/header-view');
var BlogRollView = require('views/home/blog-roll-view');

module.exports = Controller.extend({
    beforeAction: function() {
        this.constructor.__super__.beforeAction.apply(this, arguments);
        this.reuse('header', HeaderView, {
            region: 'header'
        });
    },

    blogRoll: function() {
        this.view = new BlogRollView({
            region: 'main'
        });
    },
});