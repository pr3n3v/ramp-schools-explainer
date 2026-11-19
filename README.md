# Ramp Schools explainer site

A one-page website that explains Ramp Schools: every subject in Vietnamese and English, the Ramp English course in three levels, the teacher tools, the Giúp helper, the safe corner, careers, and what parents and school leaders see. It is the web version of the Ramp Schools explainer PDF, which it also offers as a download.

Only the founder publishes this site. Nothing here is published until the founder says so.

## What is in the folder

- `index.html`: the page. It works with JavaScript off; the script only adds the interactive parts.
- `credits.html`: the credits for the reference vowel recordings, the British IPA (Britfone), the icons and the fonts.
- `assets/css/site.css`, `assets/js/site.js`: the styles and the script. No framework, no build step needed to serve.
- `assets/img/`: real screenshots of Ramp as WebP, cropped and never painted over, with their metadata removed.
- `assets/audio/`: nine reference vowel recordings from Wikimedia Commons (CC BY-SA), as MP3 for every browser and the original OGG streams. See `credits.html`.
- `assets/og-cover.jpg`: the 1200 x 630 sharing image. `assets/favicon.svg`: the Ramp mark.
- `Ramp-Schools-explainer-v2.pdf`: the printable explainer. Its document info holds only the title.
- `.nojekyll`: tells GitHub Pages to serve the files as they are.

All paths are relative, so the site works from a GitHub Pages sub-path such as `https://<user>.github.io/<repo>/`.

## Before publishing

- The page carries `<meta name="robots" content="noindex, nofollow">` so search engines skip it. The founder decides later whether it should be indexed; to allow it, remove that line from `index.html` and `credits.html`.
- Social previews need an absolute image address. Once the site's address is known, change `content="assets/og-cover.jpg"` in `index.html` to the full URL.
- Contact: the closing section's main button emails pr3n3v@gmail.com (the founder's choice, 19 Nov 2026, "for now"). Change it in index.src.html and rebuild.
- Only nine vowels play a sample. If the founder wants every tile to play, openly licensed recordings of the other IPA sounds could be added from Wikimedia Commons, credited the same way.
- The page is in English with the app's Vietnamese labels quoted. A Vietnamese version should be written and reviewed by a person, not machine-drafted.

## Privacy

No analytics, trackers or cookies. The two web fonts load from the public Google Fonts service, which sets no cookies. Everything else is served from this folder.

## Licences

- Icons: Lucide, ISC licence (a few derived from Feather, MIT). Full text in `assets/LICENSE-lucide.txt`.
- Fonts: Bricolage Grotesque and Inter, SIL Open Font Licence 1.1.
- Reference vowel recordings: Wikimedia Commons, CC BY-SA 3.0 or 4.0, authors and sources listed in `credits.html`. The MP3 copies are conversions of those files and are shared under the same licence.
- British IPA on the word cards (inside screenshots only): Britfone 3.0.1 by Jose Llarena, MIT licence; notice in `credits.html`.
- Screens, drawings and text: Ramp.
