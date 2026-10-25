# Interaction contract

## Source

Business scope: docs/PRODUCT.md, based on the user's approved plan and instruction to begin building locally. Privacy and persistence: docs/ARCHITECTURE.md. No permissions, billing, remote deletion or account lifecycle is present.

## Canonical UI Map

| Capability     | Canonical owner                             | Source of truth | Allowed variants               | Verification                    |
| -------------- | ------------------------------------------- | --------------- | ------------------------------ | ------------------------------- |
| Select/Listbox | Native select in src/main.ts                | DESIGN.md       | OS-owned popup                 | Browser keyboard and open popup |
| Date           | Native datetime-local input in renderFields | PRODUCT.md      | OS locale                      | Event payload tests             |
| Form           | renderFields + content.payload              | PRODUCT.md      | QR content/barcode             | Unit validation and browser     |
| Scrollbar      | src/style.css global baseline               | DESIGN.md       | Forced-colours system fallback | Static audit and browser        |
| Toast          | notify() and #toast live region             | This contract   | Success/error information      | Browser                         |

## Behavior

- QR and barcode mode switches retain entered controls in memory; QR content choices retain their own field values during this session.
- Every field has a visible label. Native input/select behavior is intentional. No form uses browser validation bubbles.
- Preview updates on edits, rejects stale async completion, clears invalid output and disables export when generation fails.
- Field errors are currently shown in a single alert beside the preview; field-specific associations are a future accessibility improvement.
- Export independently validates current content, disables its button while busy and announces success/failure. Clipboard is disabled when unsupported.
- Transparent exports preserve alpha except for optional logo backing; JPEG always uses the selected solid background.
- Logo imports validate format/size; failures keep the prior valid logo. Social icon choice clears uploaded logo.
- Save style is explicit; stores only settings, never uploaded logo or caption. Matching names replace existing styles. Delete affects only the selected style. JSON imports are bounded and allowlisted.
- Batch snapshots settings, emits row errors in the ZIP, yields progress and supports cancellation without downloading an incomplete archive.
- Native dialog handles focus trapping, Escape and return focus. Notifications are nonblocking. No native alert/confirm/prompt calls.
- UI copy is English. Event datetime fields use browser locale; dates are converted from local input to UTC in the payload.
- No project history, server communication or content persistence exists. There are no equivalent sibling flows to compare at initial creation.

## Static audit limitation

The premium static auditor does not follow imperative TypeScript event bindings or delegated handlers. Its actionless-button findings for main.ts are false positives: the buttons are connected via onclick properties and parent event delegation. Verify these with actual browser interactions rather than adding inline JavaScript attributes to satisfy the scanner. Native select ownership is declared in premium-ui.json; textarea resize is applied globally and with the shared resize-none class.
