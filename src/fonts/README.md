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

## Inter

- File: `Inter-latin.woff2`
- Family: `Inter`, variable weight axis 400–700, style normal
- License: SIL Open Font License 1.1 (see `Inter-LICENSE.txt`)
- Designer: The Inter Project Authors (https://github.com/rsms/inter)
- Source: Google Fonts (`https://fonts.google.com/specimen/Inter`),
  woff2 latin subset (Inter v20) fetched from
  `https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2`

This is the genuine upstream font, vendored to remove the runtime dependency on
the Google Fonts CDN. It is referenced via the `@font-face` rule at the top of
`src/styles.css`. Google serves the Inter latin subset as a single variable
woff2 spanning the weight axis, so one file covers weights 400–700 (the range
the design tokens use); it is declared with `font-weight: 400 700`. Only the
latin subset is vendored — the design's UI copy is Latin-only, matching the
subset the CDN previously served for this app.

To refresh, re-download the same file from the URL above and replace the woff2.
