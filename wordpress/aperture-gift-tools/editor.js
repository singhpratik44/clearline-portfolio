/* APERTURE Gift Tools — GPL-2.0-or-later */
(function (wp) {
	'use strict';
	const el = wp.element.createElement;
	const __ = wp.i18n.__;
	wp.blocks.registerBlockType('aperture/gift-tool', {
		apiVersion: 3,
		title: __('APERTURE Gift Tool', 'aperture-gift-tools'),
		icon: 'heart',
		category: 'widgets',
		attributes: { tool: { type: 'string', default: 'secret-santa' } },
		edit: function (props) {
			return el('div', wp.blockEditor.useBlockProps(),
				el(wp.components.SelectControl, {
					label: __('Gift experience', 'aperture-gift-tools'),
					value: props.attributes.tool,
					options: [
						{ value: 'secret-santa', label: __('Secret Santa · on this site', 'aperture-gift-tools') },
						{ value: 'group-card', label: __('Group Card · on this site', 'aperture-gift-tools') },
						{ value: 'finder', label: __('Gift Finder · link to APERTURE', 'aperture-gift-tools') },
						{ value: 'postcard', label: __('Postcard Maker · link to APERTURE', 'aperture-gift-tools') }
					],
					onChange: function (value) { props.setAttributes({ tool: value }); }
				})
			);
		},
		save: function () { return null; }
	});
})(window.wp);
