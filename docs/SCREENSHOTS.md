# Screenshot gallery

Captured 25 October 2026 from the running local Vite app at `http://127.0.0.1:5173/`. Screenshots use example content and contain no personal data. Full-page captures document the complete editor rather than only the visible viewport.

| Screenshot | State |
| --- | --- |
| [QR workspace](screenshots/qr-studio.png) | Website QR, default colours, solid white background, complete editor and export panel |
| [Social QR](screenshots/social-qr-transparent.png) | Instagram centre icon, transparent background, safety guidance and social icon picker |
| [Barcode workspace](screenshots/barcode-studio.png) | Code 128 with STUDIO-2026, readable caption, solid white background |

The checkerboard is a preview surface. Image transparency was independently checked in the downloaded PNG during initial verification. These captures are documentation assets, not comprehensive visual-regression or scan-reliability tests. The earlier `docs/preview.png` is retained as the original implementation preview.

## Refreshing the gallery

1. Run `npm ci` if dependencies are missing, then `npm run dev`.
2. Open the printed local URL in a browser.
3. Reproduce the states above using example values.
4. Capture full-page PNG screenshots and replace the corresponding files.
5. Visually review the images and update this document and README if controls or behavior changed.

Do not include personal contact data, real Wi-Fi passwords, payment details or uploaded private logos in documentation captures.
