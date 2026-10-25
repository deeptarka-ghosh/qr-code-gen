# Verification record

- TypeScript + Vite production build passed.
- Nine Node tests passed: payloads, URL/UPI/location/event rejection, Wi-Fi escaping, vCard escaping, CSV, XML, QR SVG/transparency and barcode generation.
- Browser checked URL error state, export disabling, Instagram icon selection, transparent-background selection, PNG download, Code 128 rendering and invalid EAN-13 rejection.
- Downloaded PNG verified using Pillow: 1024×1024 RGBA; corner alpha 0; alpha range 0–255.
- Browser screenshot caught and resolved an intrinsic SVG preview sizing issue.
- DESIGN.md validator: zero errors (a missing-primary warning was corrected afterward).
- Premium static audit: native select ownership recorded; textarea resize ownership fixed. Imperative event handlers are not recognized by the static actionless-button rule; remaining such findings need runtime evidence rather than inline-handler workarounds.
- Remaining checks: full mobile/keyboard matrix, camera decoding/physical print scan, all specialized payloads across reader apps, batch stress/memory and PDF printing (future feature).

## Documentation capture — 25 October 2026

Three full-page browser screenshots were captured in docs/screenshots and linked in README.md. The Code 128 screenshot was visually inspected. Captures cover default QR generation, Instagram branding with transparency, and barcode editing. Screenshot capture is not a substitute for the outstanding full keyboard/mobile, scanner compatibility and physical-print checks above. See docs/SCREENSHOTS.md for reproducible states.
