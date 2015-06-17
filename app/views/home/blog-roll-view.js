var View = require('views/base/view');

module.exports = View.extend({
  autoRender: true,
  className: 'blog-roll',
  template: require('./templates/blog-roll')
});
