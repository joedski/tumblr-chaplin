var View = require('views/base/view');

module.exports = View.extend({
    container: 'body',
    id: 'site',
    regions: {
        header: '#header',
        blogRoll: '#blog-roll',
        quicklook: '#quicklook'
    },
    template: require('./templates/site')
});