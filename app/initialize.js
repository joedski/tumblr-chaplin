var Application = require('application');
var routes = require('routes');

$(function() {
    return new Application({
        title: 'Tumblr Chaplin',
        controllerSuffix: '-controller',
        routes: routes
    });
});