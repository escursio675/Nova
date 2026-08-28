// Matches [[Target]], [[Target|Alias]], and [[Target#Heading]] (heading is
// captured but ignored for now — Obsidian uses it to jump to a section,
// which we don't support yet since we don't have in-note anchors).
const WIKILINK_REGEX = /\[\[([^\]|#]+)(#[^\]|]+)?(\|([^\]]+))?\]\]/g;

// Using a "#" fragment rather than a custom protocol (e.g. "wikilink://")
// because react-markdown's link sanitizer strips unrecognized protocols by
// default — but fragments are always considered safe and pass through
// untouched, since they can't navigate anywhere on their own.
export const WIKILINK_PREFIX = "#wikilink:";

/**
 * Rewrites [[wikilinks]] into standard markdown links using a "#wikilink:"
 * fragment, so react-markdown parses them as normal <a> tags that we can
 * then intercept and resolve to a real note — without the href being
 * sanitized away first.
 */
export function transformWikilinks(body: string): string {
  return body.replace(WIKILINK_REGEX, (_match, target, _heading, _pipe, alias) => {
    const cleanTarget = target.trim();
    const label = (alias ?? cleanTarget).trim();
    return `[${label}](${WIKILINK_PREFIX}${encodeURIComponent(cleanTarget)})`;
  });
}

export function isWikilinkHref(href: string | undefined): href is string {
  return typeof href === "string" && href.startsWith(WIKILINK_PREFIX);
}

export function getWikilinkTarget(href: string): string {
  return decodeURIComponent(href.slice(WIKILINK_PREFIX.length));
}