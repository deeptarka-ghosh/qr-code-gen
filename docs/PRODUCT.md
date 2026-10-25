# Product plan

## Objective and scope

User-approved direction: lightweight local browser app for generating QR codes and barcodes, with transparent PNG or chosen colours; broad customization, downloadable assets and famous social app icons. The complete initial planning conversation is reflected below. Building is authorized; public deployment has not been requested. Source lives in the user's workspace.

## Implemented first release

See README for the current implemented feature list. Core user journey: choose QR/barcode → enter content → customize → inspect → export. All controls shown are functional; future features are not represented as active controls.

## Full roadmap

| Area            | Delivered                                                                            | Planned                                                                                        |
| --------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| QR payloads     | Website, text, Wi-Fi, contacts, email, phone, SMS, WhatsApp, location, UPI, calendar | Richer address/contact fields, URL campaign parameters, optional map-link mode                 |
| Barcode support | Common retail, inventory, industrial, GS1 and additional 2D formats                  | Guided GS1 application identifier builder and format-specific examples                         |
| Colours         | Foreground/background, HEX input, transparency, contrast guidance                    | Opacity, gradients with scan checks, saved palettes                                            |
| QR styling      | Square, rounded, dots; standard finder patterns; quiet zone; correction level        | Separate finder shapes/colours, frame templates                                                |
| Branding        | 14 social icons, custom raster upload, icon colour and size                          | Additional maintained brand icons, backing-plate controls                                      |
| Labels          | Simple bottom caption                                                                | Heading/subtitle, fonts, spacing, alignment, rotation, adjustable frames                       |
| Export          | PNG/SVG/WebP/JPEG, common pixel widths, filename, PNG clipboard                      | Custom width, mm/inch/DPI calculator, bare-code versus framed-label export                     |
| Batch           | Raw lines or value/filename CSV; ZIP; progress/cancel/errors                         | Full column mapping, sequential identifiers, worker-based rendering, richer validation preview |
| Print           | SVG suitable for scaling                                                             | A4/Letter PDF sheets, label dimensions, rows/columns/gutters/margins, print calibration        |
| Reuse           | Saved local styles, JSON import/export                                               | Named projects, duplication, undo/redo, optional explicit content history, favourites          |
| Convenience     | Responsive keyboard-accessible workspace, preview surfaces                           | Dark interface, installable offline PWA, localization                                          |
| Verification    | Payload validation, contrast warnings, scan guidance                                 | Upload/camera scanner, automatic decode checks, physical-print QA guidance                     |

## Explicitly optional service-backed expansion

Dynamic redirect URLs, destination editing after printing, analytics, expiring/password-protected links, cloud sync, accounts and team libraries require a separately scoped backend. They are not part of the local app. No analytics or content collection is introduced implicitly.

## Constraints and acceptance criteria

- Generate without sending input to any remote service.
- Export transparency as actual alpha, not a checkerboard baked into the image.
- Preserve quiet zone and complete code geometry.
- Handle invalid values without displaying a stale downloadable code.
- Social logos remain optional and appear in exported files.
- Advanced functionality loads separately where practical.
- Do not claim retail registration, universal scanner compatibility or guaranteed scan reliability.
- Optional style persistence excludes QR content, passwords, captions and uploaded images.

## Delivery sequence

1. Current: generator, customization, downloads, social branding, saved styles and bounded batch export.
2. Next: browser decoding verification, worker-based batch jobs, print sizing/PDF sheets and richer branding.
3. Later: projects/undo, PWA, dark interface, full CSV mapping and localization.
4. Service features only after a deliberate architecture/cost decision.

## Documentation status

README.md includes setup, usage, current functionality, stack, CSV format, limits and a screenshot gallery. docs/SCREENSHOTS.md records capture states. The roadmap above remains the source of truth for implemented versus planned scope.
