---
version: alpha
colors:
  ink: "#193c33"
  primary: "#17634b"
  muted: "#62776f"
  border: "#dbe4df"
  paper: "#ffffff"
  canvas: "#f3f6f4"
typography:
  body:
    fontFamily: "Segoe UI, Arial, sans-serif"
  display:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
  utility:
    fontFamily: "Consolas, monospace"
rounded:
  panel: "12px"
  control: "7px"
spacing:
  panel: "24px"
  gap: "28px"
---

# Code Studio design

## Overview

Product/tool register. A browser workbench for people making a QR or barcode for print, contact sharing and social profiles. Reference: a small print studio's proof sheet, expressed through a quiet green tool palette and a prominent checkerboard proof area. The QR itself is the signature visual; do not add decorative QR-like noise. No existing sibling screens or maintained identity existed at project creation. English UI; Unicode payloads supported; no Japanese-market requirements.

## Colors

Runtime `src/style.css :root` is the canonical token owner. Documentation mirrors its durable role values: ink→--ink, accent→--accent, muted→--muted, border→--border, paper→--paper; canvas→root background. Shared controls consume these aliases. Update this document with runtime palette changes. Code colours are user content, separate from application tokens. Warnings use amber and errors use rust; all include text.

## Typography

System Segoe UI body avoids font downloads; Trebuchet display adds a compact humanist shape. Consolas is reserved for dimensions and utility annotations. Body input text remains legible, with muted small text used only for supplementary content.

## Layout

Desktop editor and sticky proof/export column; single column below 680px. Content forms use native inputs. Responsive grids shrink without clipping. Natural document scrolling owns the page. Scrollbar track/thumb/hover/active are global with forced-colour fallback.

## Elevation & Depth

Flat bordered panels; tiny proof shadow only. Notifications float above the workspace. Dialog uses native top-layer behavior.

## Shapes

12px panels, 7px controls, 6px icon buttons. Shapes do not imply different behavior for equivalent controls.

## Components

Native selects intentionally retain OS popup geometry and keyboard operation. Native dialog owns modal focus and Escape. Shared semantic buttons use pressed states for single-choice button groups. Error and status regions preserve text feedback; preview geometry stays fixed through invalid states. Uploaded images reserve the existing proof area.

## Do's and Don'ts

Use action labels that explain the resulting file or change. Keep advanced controls in details disclosures. Do not expose roadmap features as active UI. Do not use remote fonts, tracking or network requests for generation. Honour reduced motion. Use visible focus and native labels. Do not silently save payloads or logos.
