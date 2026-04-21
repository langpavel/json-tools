# Store listing assets

These SVGs are **templates**, not final art. Open them in Inkscape or Figma,
replace the placeholder strings with the final tagline/screenshot, and export
the required PNGs before uploading to the Chrome Web Store listing.

Do not commit the exported PNGs — keep this directory as the source of truth
and export on demand.

## Files

| File | Purpose | Size |
| --- | --- | --- |
| `promo-small.svg` | Small promo tile | 440 x 280 |
| `promo-marquee.svg` | Marquee promo tile | 1400 x 560 |
| `screenshot-1.svg` | Listing screenshot mock | 1280 x 800 |

## Official Chrome Web Store size requirements

- **Store icon:** 128 x 128 PNG (sourced from `public/icons/icon.svg`).
- **Screenshots:** 1280 x 800 or 640 x 400, PNG or JPEG. At least one;
  up to five.
- **Small promo tile:** 440 x 280 PNG (required).
- **Marquee promo tile:** 1400 x 560 PNG (optional, shown on featured rows).

Requirements occasionally drift — confirm against the Chrome Web Store
developer dashboard before submission.

## Export checklist

1. Replace placeholder tagline if a new one is picked.
2. Swap `screenshot-1.svg` for a real capture of the extension rendering a
   representative JSON document.
3. Export PNGs at exactly the sizes above.
4. Strip the TEMPLATE watermark in the corner before exporting.
