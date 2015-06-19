var View = require( 'views/base/view' );
var PostPermalinkMetaView = require( './post-permalink-meta-view' );
var postContentViewForModel = require( './post-content-view-for-model' );

module.exports = View.extend({
	className: 'post-permalink',
	template: require( './templates/post-permalink' ),
	regions: {
		'content': '.post-content-container',
		'meta': '.post-meta-container'
	},

	getTemplateData: function() {
		return this.model.attributes;
	},

	render: function() {
		View.prototype.render.apply( this, arguments );

		this.subview( 'meta', new PostPermalinkMetaView({
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