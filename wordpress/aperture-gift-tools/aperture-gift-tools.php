<?php
/**
 * Plugin Name: APERTURE Gift Tools
 * Description: Add a Secret Santa draw or a group card to a page with the Gift Tool block or a shortcode.
 * Version: 1.0.0
 * Author: APERTURE
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Requires at least: 6.3
 * Requires PHP: 7.4
 * Text Domain: aperture-gift-tools
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render only a selected built-in experience. Viewer-supplied URLs are never accepted.
 */
function aperture_gift_tools_render( $attributes ) {
	$tool = isset( $attributes['tool'] ) && is_string( $attributes['tool'] ) ? $attributes['tool'] : 'secret-santa';
	$local = array(
		'secret-santa' => array( 'secret-santa.html', __( 'Secret Santa generator', 'aperture-gift-tools' ) ),
		'group-card'   => array( 'group-card.html', __( 'Group card maker', 'aperture-gift-tools' ) ),
	);
	$external = array(
		'finder'   => array( 'https://singhpratik44.github.io/clearline-portfolio/gifts/finder/', __( 'Open Gift Finder on APERTURE', 'aperture-gift-tools' ) ),
		'postcard' => array( 'https://singhpratik44.github.io/clearline-portfolio/gifts/holiday-thank-you/', __( 'Make a postcard on APERTURE', 'aperture-gift-tools' ) ),
	);
	if ( isset( $external[ $tool ] ) ) {
		return sprintf( '<p><a rel="noreferrer" href="%s">%s</a></p>', esc_url( $external[ $tool ][0] ), esc_html( $external[ $tool ][1] ) );
	}
	if ( ! isset( $local[ $tool ] ) ) {
		return '<p>' . esc_html__( 'Choose Secret Santa, Group Card, Gift Finder or Postcard.', 'aperture-gift-tools' ) . '</p>';
	}
	$url   = plugins_url( 'tools/' . $local[ $tool ][0], __FILE__ );
	$title = $local[ $tool ][1];
	return sprintf(
		'<div class="wp-block-aperture-gift-tool"><iframe src="%1$s" title="%2$s" width="100%%" height="740" style="display:block;width:100%%;border:0" loading="lazy" referrerpolicy="no-referrer" allow="clipboard-write; web-share"></iframe><p><a href="%1$s">%3$s</a></p></div>',
		esc_url( $url ),
		esc_attr( $title ),
		esc_html( sprintf( /* translators: %s: name of the gift tool. */ __( 'Open %s full screen', 'aperture-gift-tools' ), $title ) )
	);
}

function aperture_gift_tools_shortcode( $atts ) {
	return aperture_gift_tools_render( shortcode_atts( array( 'tool' => 'secret-santa' ), $atts, 'aperture_gift_tool' ) );
}

function aperture_gift_tools_register() {
	add_shortcode( 'aperture_gift_tool', 'aperture_gift_tools_shortcode' );
	wp_register_script(
		'aperture-gift-tools-editor',
		plugins_url( 'editor.js', __FILE__ ),
		array( 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-i18n' ),
		'1.0.0',
		true
	);
	register_block_type(
		'aperture/gift-tool',
		array(
			'api_version'     => 3,
			'attributes'      => array( 'tool' => array( 'type' => 'string', 'default' => 'secret-santa' ) ),
			'editor_script'   => 'aperture-gift-tools-editor',
			'render_callback' => 'aperture_gift_tools_render',
		)
	);
}
add_action( 'init', 'aperture_gift_tools_register' );
