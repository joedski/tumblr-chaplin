var View = require( 'views/base/view' );
var PostMetaView = require( './post-meta-view' );
var postContentViewForModel = require( './post-content-view-for-model' );

var PostView = module.exports = View.extend({
	tagName: 'article',
	className: 'post',

	template: require( './templates/post' ),
	regions: {
		'content': '.post-content-container',
		'meta': '.post-meta-container'
	},

	getTemplateData: function() {
		return this.model.attributes;
	},

	render: function() {
		View.prototype.render.apply( this, arguments );

		this.subview( 'meta', new PostMetaView({
			model: this.model,
			container: this.$( this.regions.meta ),
			autoRender: true
		}));

		this.subview( 'content', new (postContentViewForModel( this.model ))({
			model: this.model,
			container: this.$( this.regions.content ),
			autoRender: true
		}));

		fastdom.write( function() {
			this.$el.attr( 'data-post-id', this.model.get( 'id' ) );
		}, this );
	},
});
