# Code Studio

A lightweight browser-only QR code and barcode maker. All encoding, logo processing, PNG/SVG export and batch ZIP creation happen locally. No account, API key, backend, analytics or paid service.

## Run

Requires Node.js 20.19+ or 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. Production: `npm run build`; serve `dist/` on any static HTTPS host. `npm run preview` previews the production build locally. Clipboard export requires a secure context (HTTPS or localhost) and browser permission.

## Available now

- QR content: URL, text, Wi-Fi, vCard contact, email, phone, SMS, WhatsApp, geographic coordinates, UPI and calendar event.
- Barcode formats: Code 128/39/93, EAN-13/8, UPC-A/E, ITF/ITF-14, Codabar, GS1-128, Data Matrix, PDF417, Aztec.
- Live preview, input errors, encoded-content inspection and contrast guidance.
- Foreground/background colours, transparent background, square/rounded/dot QR modules, quiet zone, QR correction level, captions, barcode height/readable text.
- Facebook, Instagram, WhatsApp, YouTube, X, Telegram, TikTok, Pinterest, Snapchat, Discord, Reddit, GitHub, Threads, Spotify icons; adjustable colour/size; custom PNG/JPEG/WebP logo upload.
- PNG, SVG, WebP and JPEG downloads at 256–4096 px width. SVG is resolution independent. JPEG uses a solid background. Copy PNG where supported.
- Saved local styles (no content or uploaded logos), style JSON import/export.
- Batch raw values/CSV to PNG ZIP, cancellation, per-row errors, unique filenames. Up to 200 items; batch width capped at 2048 px to limit memory use.
- Responsive layout, keyboard controls, native accessible inputs, reduced-motion and high-contrast support.

## Documentation

- [Product plan and full roadmap](docs/PRODUCT.md)
- [Architecture and operational notes](docs/ARCHITECTURE.md)
- [Design decisions](DESIGN.md)
- [Interaction contract](UX-CONTRACT.md)

## Checks

`npm test` runs payload, validation, CSV parsing and SVG generation tests. `npm run build` checks TypeScript and builds the production bundle.

## Important behavior

Static QR codes cannot change destination after printing. Specialized content depends on the reader app; test with your actual devices. Retail identifiers must be legitimately assigned separately. A decoder check or a visually attractive preview cannot guarantee physical scanning. Transparent backgrounds require sufficient contrast at their final placement. Logos have a solid backing plate even in otherwise transparent exports. Use a short caption to avoid clipping. Style JSON deliberately excludes content, uploaded logos and captions. No content is saved automatically.

## Brand assets

Icons are sourced from Simple Icons. Logos and names remain the property of their respective owners; review individual brand guidelines before public/commercial use. No endorsement is implied. See the installed `simple-icons` package for its license and asset metadata.
