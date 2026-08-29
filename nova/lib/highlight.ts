// Matches ==highlighted text== — Obsidian's highlight syntax, which isn't
// part of standard markdown, so we convert it to a real <mark> tag before
// handing the body to react-markdown (rendered via rehype-raw).
const HIGHLIGHT_REGEX = /==(.+?)==/g;

export function transformHighlights(body: string): string {
  return body.replace(HIGHLIGHT_REGEX, (_match, text) => `<mark>${text}</mark>`);
}