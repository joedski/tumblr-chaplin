var View = require('views/base/view');

module.exports = View.extend({
    container: 'body',
    id: 'site',
    regions: {
        header: '#header',
        blogRoll: '#blog-roll',
        permalink: '#permalink-container'
    },
    template: require('./templates/site')
});