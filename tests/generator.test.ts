import { test } from "node:test";
import assert from "node:assert/strict";
import {
  payload,
  escapeXml,
  parseCSV,
  contrast,
  safeFilename,
} from "../src/content";
import { generateSvg, defaults, barcodeTypes } from "../src/generator";
test("URL requires a usable web protocol", () => {
  assert.equal(
    payload("url", { value: "https://example.com/a?q=1" }),
    "https://example.com/a?q=1",
  );
  assert.throws(() => payload("url", { value: "javascript:alert(1)" }));
  assert.throws(() => payload("url", { value: "" }));
});
test("Wi-Fi punctuation is escaped and hidden flag preserved", () => {
  assert.equal(
    payload("wifi", {
      ssid: "Office;A",
      password: "a:b",
      security: "WPA",
      hidden: "true",
    }),
    "WIFI:T:WPA;S:Office\\;A;P:a\\:b;H:true;;",
  );
});
test("contact prevents newline field injection", () => {
  const data = payload("contact", { name: "Sam\nTEL:123" });
  assert.ok(data.includes("FN:Sam\\nTEL:123"));
  assert.equal(data.split("\r\n").filter((x) => x === "TEL:123").length, 0);
});
test("UPI validates amount and escapes names", () => {
  assert.throws(() =>
    payload("upi", { upi: "x@bank", name: "X", amount: "-1" }),
  );
  assert.ok(
    payload("upi", { upi: "x@bank", name: "A & B", amount: "10.50" }).includes(
      "pn=A+%26+B",
    ),
  );
});
test("location and event boundaries", () => {
  assert.throws(() => payload("location", { latitude: "91", longitude: "0" }));
  assert.throws(() =>
    payload("event", {
      title: "Meeting",
      start: "2026-01-02T10:00",
      end: "2026-01-01T10:00",
    }),
  );
  assert.equal(
    payload("location", { latitude: "0", longitude: "0" }),
    "geo:0,0",
  );
});
test("CSV supports quoted commas, escaped quotes and CRLF", () => {
  assert.deepEqual(parseCSV('value,filename\r\n"a,b","my ""code"""'), [
    ["value", "filename"],
    ["a,b", 'my "code"'],
  ]);
  assert.throws(() => parseCSV('"unterminated'));
});
test("XML and filenames are escaped", () => {
  assert.equal(escapeXml('<&"'), "&lt;&amp;&quot;");
  assert.equal(safeFilename("../../x"), "x".padStart(2, "-"));
  assert.equal(contrast("#000000", "#ffffff"), 21);
});
test("QR transparency, caption escaping and high-density payload", async () => {
  const s = await generateSvg("hello", "qr", "code128", {
    ...defaults,
    transparent: true,
    caption: "<script>",
  });
  assert.ok(s.includes("&lt;script&gt;"));
  assert.ok(!s.includes('<rect width="100%"'));
  assert.ok(s.includes("viewBox="));
  await assert.rejects(() =>
    generateSvg("x".repeat(10000), "qr", "code128", defaults),
  );
});
test("barcode generators produce SVG and reject invalid retail input", async () => {
  for (const type of [
    "code128",
    "code39",
    "code93",
    "datamatrix",
    "pdf417",
    "azteccode",
  ]) {
    const svg = await generateSvg("STUDIO2026", "barcode", type, defaults);
    assert.ok(svg.includes("<svg"), type);
  }
  await assert.rejects(() => generateSvg("ABC", "barcode", "ean13", defaults));
  assert.equal(barcodeTypes.length, 14);
});
