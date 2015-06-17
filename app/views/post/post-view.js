var View = require( 'views/base/view' );
var PostMetaView = require( './post-meta-view' );

var PostView = module.exports = View.extend({
	tagName: 'article',
	className: 'post',

	template: require( './templates/post' ),
	regions: {
		'body': '.post-body',
		'meta': '.post-meta'
	},

	getTemplateData: function() {
		return this.model.attributes;
	},

	render: function() {
		View.prototype.render.apply( this, arguments );

		this.subview( 'meta', new PostMetaView({
			model: this.model,
			container: this.$( this.regions.meta )
		}));

		fastdom.write( function() {
			this.$el.attr( 'data-post-id', this.model.get( 'id' ) );
		}, this );
	},
});
