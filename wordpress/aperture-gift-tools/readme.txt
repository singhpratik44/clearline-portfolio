=== APERTURE Gift Tools ===
Tags: gifts, secret santa, group card, shortcode, blocks
Requires at least: 6.3
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

Publish a Secret Santa exchange or a signed group card on your WordPress site.

== Installation ==
1. Upload the ZIP in Plugins > Add Plugin > Upload Plugin, then activate APERTURE Gift Tools.
2. Add the APERTURE Gift Tool block to a page. Choose the experience and publish. Classic Editor users can insert a shortcode instead.

== Shortcodes ==
[aperture_gift_tool tool="secret-santa"] — generate a different reveal link for every giver.
[aperture_gift_tool tool="group-card"] — an organizer assembles signed notes, previews the card and shares one reveal link.
[aperture_gift_tool tool="finder"] — link to APERTURE's hosted catalog finder.
[aperture_gift_tool tool="postcard"] — link to APERTURE's hosted printable postcard maker.

== Privacy and hosting ==
Secret Santa and Group Card are bundled files served by the WordPress installation or its configured plugin-asset CDN. Their links use the same asset address and contain the assignment or notes in the URL fragment. Anyone holding a complete link can open it. Removing the plugin or changing its public asset URL can break links. The tools do not save drafts on the server, collect addresses or send messages automatically. Hosts and browsers apply their usual policies to ordinary page requests. Only someone who follows an optional APERTURE link visits the external site. See https://singhpratik44.github.io/clearline-portfolio/gifts/terms.html for APERTURE's gift terms and privacy information.

== License ==
Copyright 2026 APERTURE. The plugin code and its bundled tools are licensed under the GNU General Public License, version 2 or later. The full GPL v2 text is in LICENSE.
