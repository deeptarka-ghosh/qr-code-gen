# Architecture

## Stack

Vanilla TypeScript + Vite; plain CSS; qrcode for module matrices; lazy bwip-js for barcode rendering; Simple Icons named imports for brand paths; lazy fflate for ZIP export. Native Canvas/Blob/Clipboard/File APIs handle images and downloads. LocalStorage stores explicit named styles only. No runtime CDN, web font request, backend or database.

## Modules

- `src/content.ts`: pure payload building, format validation, XML escaping, contrast, filenames, CSV parsing.
- `src/generator.ts`: QR matrix SVG renderer, barcode adapter, SVG→raster, Blob download lifecycle.
- `src/icons.ts`: curated named icon exports, bundled locally.
- `src/main.ts`: canonical native fields, state, editor, revision-guarded async rendering, import/export and batch controller.
- `src/style.css`: global tokens, shared controls and responsive layout.

## Rendering and concurrency

Every preview request gets a monotonically increasing revision. A superseded async result cannot overwrite newer content or validation. Export snapshots current controls independently. Batch snapshots options/mode and bounds count and pixel size; it yields between images and supports cancellation. Batch runs on the main thread in this first version; a Web Worker is planned. ZIP files are held in memory, so memory use grows with batch size. Downloads and preview object URLs are revoked.

PNG uses nearest-neighbour Canvas sampling to avoid blurred module boundaries. The requested width is exact; arbitrary scaling can distribute module widths unevenly. Integer-module export sizing and physical-size presets are a planned refinement. SVG remains the best scalable print format.

## Import boundaries

Uploaded logos accept raster PNG/JPEG/WebP only, max 2 MB and 8192 px per side. SVG uploads are excluded to avoid external references or active content. Rendered text and data URLs are XML escaped. Imported styles use an allowlist and value bounds; imported content cannot inject markup. CSV values become encoded data, never HTML. Sensitive content stays in memory. Style deletion is immediate, scoped to a named style and does not delete code content.

## Compatibility and deployment

Target current Chromium, Firefox and Safari. Image copying is feature detected and can require permission. Browser download behavior differs on mobile. Specialized QR payloads depend on reader apps; UPI requires a compatible payment app. The source may be hosted statically; deployment is not included in this local build.

## Future architectural boundaries

Use IndexedDB for optional project storage; use workers for large batches; lazy-load PDF/scanner/PWA functionality. Add backend infrastructure only for dynamic codes, shared storage or accounts. Keep static codes independent from hosting uptime.
