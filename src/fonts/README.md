# Vendored fonts

## Share Tech Mono

- File: `ShareTechMono-Regular.woff2`
- Family: `Share Tech Mono`, weight 400, style normal
- License: SIL Open Font License 1.1 (see `LICENSE.txt`)
- Designer: Carrois Type Design, Ralph du Carrois (Reserved Font Name 'Share')
- Source: Google Fonts (`https://fonts.google.com/specimen/Share+Tech+Mono`),
  woff2 latin subset fetched from
  `https://fonts.gstatic.com/s/sharetechmono/v16/J7aHnp1uDWRBEqV98dVQztYldFcLowEF.woff2`

This is the genuine upstream font, vendored to remove the runtime dependency on
the Google Fonts CDN. It is referenced via the `@font-face` rule at the top of
`src/styles.css`. Share Tech Mono is a Latin-only typeface, so the single latin
subset covers its full glyph set.

To refresh, re-download the same file from the URL above and replace the woff2.
