import "./style.css";
import {
  payload,
  escapeXml,
  contrast,
  safeFilename,
  parseCSV,
  type ContentKind,
} from "./content";
import {
  defaults,
  barcodeTypes,
  generateSvg,
  rasterize,
  download,
  type Options,
} from "./generator";
const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
let mode: "qr" | "barcode" = "qr",
  kind: ContentKind = "url",
  options = { ...defaults },
  svg = "",
  revision = 0,
  logo = "",
  busy = false;
const values: Partial<Record<ContentKind, Record<string, string>>> = {
  url: { value: "https://example.com" },
};
const kinds: [ContentKind, string, string][] = [
  ["url", "Website", "↗"],
  ["text", "Text", "T"],
  ["wifi", "Wi-Fi", "⌁"],
  ["contact", "Contact", "♙"],
  ["email", "Email", "@"],
  ["phone", "Phone", "☎"],
  ["sms", "SMS", "☏"],
  ["whatsapp", "WhatsApp", "◉"],
  ["location", "Location", "⌖"],
  ["upi", "UPI payment", "₹"],
  ["event", "Event", "▦"],
];
const fieldSets: Record<ContentKind, [string, string, string?, string?][]> = {
  url: [["value", "Website address", "url", "https://example.com"]],
  text: [["value", "Your text", "textarea", "Write something worth sharing…"]],
  wifi: [
    ["ssid", "Network name"],
    ["password", "Password", "password"],
    ["security", "Security", "security"],
    ["hidden", "Hidden network", "hidden"],
  ],
  email: [
    ["email", "Email address", "email"],
    ["subject", "Subject"],
    ["message", "Message", "textarea"],
  ],
  phone: [["phone", "Phone number", "tel", "+91…"]],
  sms: [
    ["phone", "Phone number", "tel"],
    ["message", "Message", "textarea"],
  ],
  whatsapp: [
    ["phone", "Phone number with country code", "tel", "+91…"],
    ["message", "Prefilled message", "textarea"],
  ],
  contact: [
    ["name", "Full name"],
    ["company", "Company"],
    ["phone", "Phone number", "tel"],
    ["email", "Email address", "email"],
    ["website", "Website", "url"],
  ],
  location: [
    ["latitude", "Latitude", "text", "28.6139"],
    ["longitude", "Longitude", "text", "77.2090"],
  ],
  upi: [
    ["upi", "UPI ID", "text", "name@bank"],
    ["name", "Recipient name"],
    ["amount", "Amount (optional)", "text", "100.00"],
    ["note", "Payment note"],
  ],
  event: [
    ["title", "Event title"],
    ["start", "Starts", "datetime-local"],
    ["end", "Ends", "datetime-local"],
    ["location", "Location"],
    ["description", "Description", "textarea"],
  ],
};
$("#app").innerHTML = `
<header><a class="brand" href="./" aria-label="Code Studio home"><span class="brand-mark">▦</span> code<span>studio</span><small>LOCAL EDITION</small></a><span class="privacy"><i></i> Made here. Stays here.</span><button id="help" class="quiet">About & shortcuts</button></header>
<main><div class="intro"><div><p class="eyebrow">A SMALL TOOL FOR BIG CONNECTIONS</p><h1>Make your next connection.</h1><p>QR codes & barcodes. Your colours, your way.</p></div><span class="edition">NO ACCOUNTS.<br>NO UPLOADS.<br>JUST CODES.</span></div>
<div class="workspace"><section class="editor" aria-label="Code editor"><div class="mode-switch" aria-label="Code type"><button id="qrMode" aria-pressed="true">▦ &nbsp; QR code</button><button id="barMode" aria-pressed="false">▥ &nbsp; Barcode</button></div>
<div class="section-title"><span class="step">1</span><h2>Add your content</h2><span class="micro" id="contentLabel">WHAT SHOULD IT OPEN?</span></div>
<div id="qrContent"><div id="contentTypes" class="content-types">${kinds.map(([id, name, icon]) => `<button data-kind="${id}" aria-pressed="${id === kind}"><b>${icon}</b>${name}</button>`).join("")}</div><form id="fields" novalidate></form></div>
<div id="barContent" hidden><label>Barcode format<select id="barcodeType">${barcodeTypes.map(([id, label]) => `<option value="${id}">${label}</option>`).join("")}</select></label><label>Value to encode<input id="barcodeValue" value="STUDIO-2026" spellcheck="false"></label><p class="hint">Retail formats require the correct numeric length and check digit. GS1 uses AI notation, such as (01)…</p><div class="two"><label>Bar height (mm)<input id="barHeight" type="number" min="5" max="100" value="18"></label><label class="check"><input id="showText" type="checkbox" checked>Show readable text</label></div></div>
<div class="section-title"><span class="step">2</span><h2>Make it yours</h2><button id="resetStyle" class="text-button">Reset style</button></div>
<div class="two"><label>Code colour<div class="colour-input"><input id="foreground" type="color" value="${options.foreground}" aria-label="Code colour"><input id="foregroundHex" value="${options.foreground}" aria-label="Code HEX colour" maxlength="7" spellcheck="false"></div></label><label>Background colour<div class="colour-input"><input id="background" type="color" value="#ffffff" aria-label="Background colour"><input id="backgroundHex" value="#ffffff" aria-label="Background HEX colour" maxlength="7" spellcheck="false"></div></label></div>
<label class="check"><input id="transparent" type="checkbox">Transparent background <span class="tag">PNG + SVG</span></label>
<div id="qrStyle"><label>Pattern style<div class="segmented" id="patterns"><button data-style="square" aria-pressed="true">▦ &nbsp; Square</button><button data-style="rounded" aria-pressed="false">▣ &nbsp; Rounded</button><button data-style="dots" aria-pressed="false">⠿ &nbsp; Dots</button></div></label>
<details open><summary>Social icons & logo <span>Optional</span></summary><p class="hint">Add a familiar face to the centre of your QR code.</p><div class="icon-grid" id="icons"><button data-icon="" aria-pressed="true" title="No icon">None</button></div><div class="two"><label class="upload-button">Upload your logo<input id="logoUpload" type="file" accept="image/png,image/jpeg,image/webp"></label><button id="removeLogo" class="quiet" hidden>Remove uploaded logo</button></div><p class="hint" id="logoStatus">PNG, JPEG or WebP · up to 2 MB · processed locally</p><div class="two"><label>Icon colour<input type="color" id="iconColor" value="${options.iconColor}"></label><label>Icon size <output id="iconSizeValue">18%</output><input type="range" id="iconSize" min="10" max="22" value="18"></label></div></details>
</div><details><summary>Advanced settings</summary><div class="two"><label>Quiet zone (modules)<input id="margin" type="number" min="4" max="16" value="4"></label><label>Error correction<select id="ecc"><option value="L">L · 7%</option><option value="M">M · 15%</option><option value="Q">Q · 25%</option><option value="H" selected>H · 30%</option></select></label></div><p class="hint">Logos always use high error correction. Percentage indicates approximate codeword recovery, not safe logo coverage.</p><label>Caption (optional)<input id="caption" maxlength="60" placeholder="Scan to connect"></label></details>
<details><summary>Saved styles <span>On this browser</span></summary><div class="inline"><input id="presetName" aria-label="Style name" placeholder="My brand style" maxlength="40"><button id="savePreset" class="quiet">Save style</button></div><div id="presets" class="presets"></div><button id="exportSettings" class="text-button">Export style JSON</button><label class="text-button">Import style JSON<input id="importSettings" type="file" accept=".json" hidden></label></details>
<details id="batchPanel"><summary>Batch studio <span>ZIP export</span></summary><p class="hint">One raw value per line, or CSV with <code>value,filename</code> columns. Batch values are encoded directly; QR form fields are not applied. Up to 200 codes.</p><label>Batch values<textarea class="resize-none" id="batchValues" rows="5" placeholder="https://example.com\nhttps://example.org"></textarea></label><label class="upload-button">Import CSV<input id="csvUpload" type="file" accept=".csv,text/csv"></label><div class="inline"><button id="batchDownload" class="quiet">Download PNG ZIP</button><button id="cancelBatch" class="text-button" hidden>Cancel</button><span id="batchStatus" role="status"></span></div></details>
</section>
<aside class="preview-column"><div class="preview-card"><div class="preview-top"><span class="eyebrow">YOUR CODE, READY TO GO</span><span class="live"><i></i> Live preview</span></div><div class="preview-stage checker" id="stage"><div id="preview" role="img" aria-label="Generated code preview"></div><div id="previewEmpty" hidden>Enter your content to see a preview.</div></div><div class="preview-meta"><span id="dimensions">1024 × 1024 px</span><div class="preview-background" aria-label="Preview surface"><button data-surface="checker" title="Checkerboard preview" aria-label="Checkerboard preview" aria-pressed="true">▦</button><button data-surface="light" title="Light preview" aria-label="Light preview" aria-pressed="false">○</button><button data-surface="dark" title="Dark preview" aria-label="Dark preview" aria-pressed="false">●</button></div></div><p id="error" role="alert" hidden></p><p id="warning" class="warning" hidden></p><div class="export"><div class="section-title"><span class="step">3</span><h2>Take it with you</h2></div><div class="two"><label>Image width<select id="size"><option value="256">256 px</option><option value="512">512 px</option><option value="1024" selected>1024 px</option><option value="2048">2048 px</option><option value="4096">4096 px</option></select></label><label>File format<select id="format"><option value="png">PNG image</option><option value="svg">SVG vector</option><option value="webp">WebP image</option><option value="jpeg">JPEG image</option></select></label></div><label>Filename<input id="filename" value="my-code" maxlength="80"></label><button id="download" class="primary">Download PNG <span>↓</span></button><button id="copy" class="copy-button">Copy PNG to clipboard</button><p class="export-note" id="exportNote">High-resolution image · selected background</p></div></div><div class="local-note"><span>⌘</span><div><strong>A little more private.</strong><p>Your content and logos stay in this browser. Nothing is sent to a server.</p></div></div><details class="payload"><summary>Inspect encoded content</summary><pre id="encoded"></pre></details></aside></div>
<footer><span>code studio <b> / </b> a connection, without the complication.</span><span>Built to be useful. Free of tracking.</span></footer></main><div id="toast" role="status" aria-live="polite"></div>
<dialog id="about"><h2>Your browser is the studio.</h2><p>Codes are generated on your device. Styles are saved only when you choose Save style. Content and uploaded logos are never stored in saved styles.</p><p>Use Ctrl/Cmd + Enter to download. Use Tab to move through controls. Test a code with your phone before printing, especially with icons or transparent backgrounds.</p><p>Social icons come from Simple Icons. Brand marks belong to their respective owners. Inclusion does not imply affiliation.</p><button class="primary" id="closeAbout">Back to the studio</button></dialog>`;
function renderFields() {
  const data = values[kind] || {};
  $("#fields").innerHTML = fieldSets[kind]
    .map(([key, label, type = "text", placeholder = ""]) => {
      const value = escapeXml(data[key] || "");
      const id = "field-" + key;
      return `<label for="${id}">${label}${type === "textarea" ? `<textarea class="resize-none" id="${id}" name="${key}" rows="3" placeholder="${placeholder}">${value}</textarea>` : type === "security" ? `<select id="${id}" name="${key}"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">Open network</option></select>` : type === "hidden" ? `<select id="${id}" name="${key}"><option value="false">No</option><option value="true">Yes</option></select>` : `<input id="${id}" name="${key}" type="${type}" value="${value}" placeholder="${placeholder}" autocomplete="off">`}</label>`;
    })
    .join("");
  for (const select of $("#fields").querySelectorAll("select"))
    if (data[select.name]) select.value = data[select.name];
}
function currentOptions(): Options {
  const num = (id: string, min: number, max: number) => {
    const n = Number($<HTMLInputElement>("#" + id).value);
    if (!Number.isFinite(n) || n < min || n > max)
      throw Error(
        `${id === "barHeight" ? "Bar height" : "Quiet zone"} must be between ${min} and ${max}.`,
      );
    return n;
  };
  return {
    ...options,
    foreground: $<HTMLInputElement>("#foreground").value,
    background: $<HTMLInputElement>("#background").value,
    transparent: $<HTMLInputElement>("#transparent").checked,
    size: Number($<HTMLSelectElement>("#size").value),
    margin: num("margin", 4, 16),
    ecc: (options.icon || logo
      ? "H"
      : $<HTMLSelectElement>("#ecc").value) as Options["ecc"],
    iconColor: $<HTMLInputElement>("#iconColor").value,
    iconSize: Number($<HTMLInputElement>("#iconSize").value),
    logo,
    caption: $<HTMLInputElement>("#caption").value,
    barHeight: num("barHeight", 5, 100),
    showText: $<HTMLInputElement>("#showText").checked,
  };
}
function currentPayload() {
  return mode === "qr"
    ? payload(kind, values[kind] || {})
    : $<HTMLInputElement>("#barcodeValue").value;
}
async function update() {
  const ticket = ++revision;
  $("#error").hidden = true;
  try {
    const o = currentOptions(),
      text = currentPayload();
    const next = await generateSvg(
      text,
      mode,
      $<HTMLSelectElement>("#barcodeType").value,
      o,
    );
    if (ticket !== revision) return;
    svg = next;
    $("#preview").innerHTML = svg;
    $("#preview").hidden = false;
    $("#previewEmpty").hidden = true;
    $("#encoded").textContent = text;
    const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const h = vb
      ? Math.round((o.size * Number(vb[2])) / Number(vb[1]))
      : o.size;
    $("#dimensions").textContent = `${o.size} × ${h} px`;
    const warnings: string[] = [];
    if (contrast(o.foreground, o.background) < 4.5)
      warnings.push(
        "Low contrast. Dark codes on a light background scan more reliably.",
      );
    if (o.transparent)
      warnings.push(
        "Transparent image: test it on the actual background before printing.",
      );
    if (mode === "qr" && (o.icon || logo))
      warnings.push(
        "Icon backing stays solid for readability. Test the QR with your phone.",
      );
    if (o.caption.length > 30)
      warnings.push(
        "Long captions may extend beyond the image. Shorten the caption for a better fit.",
      );
    $("#warning").textContent = warnings.join(" ");
    $("#warning").hidden = !warnings.length;
    $<HTMLButtonElement>("#download").disabled = busy;
    $<HTMLButtonElement>("#copy").disabled =
      busy || !("ClipboardItem" in window) || !navigator.clipboard;
  } catch (e) {
    if (ticket !== revision) return;
    svg = "";
    $("#preview").replaceChildren();
    $("#preview").hidden = true;
    $("#previewEmpty").hidden = false;
    $("#error").textContent =
      e instanceof Error ? e.message : "Could not generate this code.";
    $("#error").hidden = false;
    $<HTMLButtonElement>("#download").disabled = true;
    $<HTMLButtonElement>("#copy").disabled = true;
    $("#encoded").textContent = "";
    $("#warning").hidden = true;
  }
}
let toastTimer: ReturnType<typeof setTimeout>;
function notify(message: string) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3500);
}
function setMode(next: "qr" | "barcode") {
  mode = next;
  $("#qrContent").hidden = next !== "qr";
  $("#barContent").hidden = next !== "barcode";
  $("#qrStyle").hidden = next !== "qr";
  $("#qrMode").setAttribute("aria-pressed", String(next === "qr"));
  $("#barMode").setAttribute("aria-pressed", String(next === "barcode"));
  $("#contentLabel").textContent =
    next === "qr" ? "WHAT SHOULD IT OPEN?" : "WHAT SHOULD IT ENCODE?";
  void update();
}
$("#qrMode").onclick = () => setMode("qr");
$("#barMode").onclick = () => setMode("barcode");
$("#contentTypes").onclick = (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-kind]");
  if (!b) return;
  kind = b.dataset.kind as ContentKind;
  $("#contentTypes")
    .querySelectorAll("button")
    .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  renderFields();
  void update();
};
$("#fields").addEventListener("submit", (e) => e.preventDefault());
$("#fields").addEventListener("input", () => {
  values[kind] = Object.fromEntries(
    new FormData($<HTMLFormElement>("#fields")).entries(),
  ) as Record<string, string>;
});
$("#patterns").onclick = (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
    "[data-style]",
  );
  if (!b) return;
  options.style = b.dataset.style!;
  $("#patterns")
    .querySelectorAll("button")
    .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  void update();
};
for (const key of ["foreground", "background"]) {
  const input = $<HTMLInputElement>("#" + key),
    hex = $<HTMLInputElement>("#" + key + "Hex");
  input.oninput = () => {
    hex.value = input.value;
    hex.setCustomValidity("");
    hex.removeAttribute("aria-invalid");
  };
  hex.oninput = () => {
    if (/^#[0-9a-f]{6}$/i.test(hex.value)) {
      input.value = hex.value;
      hex.setCustomValidity("");
      hex.removeAttribute("aria-invalid");
    } else {
      hex.setAttribute("aria-invalid", "true");
      notify("Use a HEX colour such as #173f35.");
    }
  };
}
$(".editor").addEventListener("input", () => {
  options = currentOptionsSafe();
  $("#iconSizeValue").textContent =
    $<HTMLInputElement>("#iconSize").value + "%";
  void update();
});
$(".editor").addEventListener("change", () => void update());
function currentOptionsSafe() {
  try {
    return currentOptions();
  } catch {
    return options;
  }
}
$("#size").onchange = () => void update();
$("#format").onchange = () => {
  const format = $<HTMLSelectElement>("#format").value;
  $("#download").innerHTML = `Download ${format.toUpperCase()} <span>↓</span>`;
  $("#exportNote").textContent =
    format === "svg"
      ? "Scalable vector · editable in design tools"
      : format === "jpeg"
        ? "JPEG uses the selected solid background"
        : $<HTMLInputElement>("#transparent").checked
          ? "High-resolution image · transparent background"
          : "High-resolution image · selected background";
};
$(".preview-background").onclick = (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
    "[data-surface]",
  );
  if (!b) return;
  $("#stage").className = "preview-stage " + b.dataset.surface;
  $(".preview-background")
    .querySelectorAll("button")
    .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
};
async function exportCurrent(copy = false) {
  if (busy) return;
  busy = true;
  const button = $<HTMLButtonElement>(copy ? "#copy" : "#download");
  const old = button.innerHTML;
  button.disabled = true;
  button.textContent = copy ? "Copying…" : "Preparing…";
  try {
    const o = currentOptions(),
      format = copy ? "png" : $<HTMLSelectElement>("#format").value;
    const data = await generateSvg(
      currentPayload(),
      mode,
      $<HTMLSelectElement>("#barcodeType").value,
      { ...o, transparent: format === "jpeg" ? false : o.transparent },
    );
    const blob =
      format === "svg"
        ? new Blob([data], { type: "image/svg+xml" })
        : await rasterize(data, o.size, "image/" + format);
    if (copy) {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      notify("PNG copied to clipboard.");
    } else {
      download(
        blob,
        safeFilename($<HTMLInputElement>("#filename").value) + "." + format,
      );
      notify("Your code is ready.");
    }
  } catch (e) {
    notify(
      e instanceof Error ? e.message : "Export failed. Try downloading PNG.",
    );
  } finally {
    busy = false;
    button.innerHTML = old;
    void update();
  }
}
$("#download").onclick = () => void exportCurrent();
$("#copy").onclick = () => void exportCurrent(true);
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    void exportCurrent();
  }
});
async function loadIcons() {
  try {
    const { socialIcons } = await import("./icons");
    $("#icons").insertAdjacentHTML(
      "beforeend",
      socialIcons
        .map(
          (i) =>
            `<button data-icon="${i.id}" title="${i.name}" aria-label="${i.name}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${i.path}"/></svg><span>${i.name}</span></button>`,
        )
        .join(""),
    );
    $("#icons").onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-icon]",
      );
      if (!b) return;
      options.icon = b.dataset.icon!;
      logo = "";
      $<HTMLInputElement>("#logoUpload").value = "";
      $("#removeLogo").hidden = true;
      $("#logoStatus").textContent = options.icon
        ? `${b.title} selected. Icon colour is customizable.`
        : "No icon selected.";
      $("#icons")
        .querySelectorAll("button")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      void update();
    };
  } catch {
    notify("Social icons could not load. Refresh to try again.");
  }
}
$<HTMLInputElement>("#logoUpload").onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 2 * 1024 * 1024
  ) {
    notify("Choose a PNG, JPEG or WebP under 2 MB.");
    return;
  }
  try {
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(Error("Could not read the logo."));
      r.readAsDataURL(file);
    });
    const img = new Image();
    img.src = data;
    await img.decode();
    if (img.width > 8192 || img.height > 8192)
      throw Error("Choose a logo smaller than 8192 pixels on each side.");
    logo = data;
    options.icon = "";
    $("#icons")
      .querySelectorAll("button")
      .forEach((x) => x.setAttribute("aria-pressed", "false"));
    $("#removeLogo").hidden = false;
    $("#logoStatus").textContent = file.name + " · stays on your device";
    void update();
  } catch (e) {
    notify(e instanceof Error ? e.message : "Could not load the logo.");
  }
};
$("#removeLogo").onclick = () => {
  logo = "";
  $<HTMLInputElement>("#logoUpload").value = "";
  $("#removeLogo").hidden = true;
  $("#logoStatus").textContent = "Logo removed.";
  void update();
};
function applyStyle(o: Options) {
  options = { ...o, logo: "" };
  logo = "";
  for (const key of [
    "foreground",
    "background",
    "iconColor",
    "iconSize",
    "margin",
    "ecc",
    "caption",
    "barHeight",
  ])
    $<HTMLInputElement>("#" + key).value = String(o[key as keyof Options]);
  $<HTMLInputElement>("#foregroundHex").value = o.foreground;
  $<HTMLInputElement>("#backgroundHex").value = o.background;
  $<HTMLInputElement>("#transparent").checked = o.transparent;
  $<HTMLInputElement>("#showText").checked = o.showText;
  $<HTMLSelectElement>("#size").value = String(o.size);
  $("#patterns")
    .querySelectorAll<HTMLButtonElement>("button")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.style === o.style)),
    );
  $("#icons")
    .querySelectorAll<HTMLButtonElement>("button")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.icon === o.icon)),
    );
  $("#iconSizeValue").textContent = o.iconSize + "%";
  $("#removeLogo").hidden = true;
  $<HTMLInputElement>("#logoUpload").value = "";
  $("#logoStatus").textContent = o.icon
    ? "Social icon restored."
    : "PNG, JPEG or WebP · up to 2 MB · processed locally";
  void update();
}
function validatedStyle(raw: unknown): Options {
  if (!raw || typeof raw !== "object")
    throw Error("Choose a valid Code Studio style JSON.");
  const r = raw as Record<string, unknown>;
  const o = { ...defaults };
  for (const key of ["foreground", "background", "iconColor"] as const) {
    if (typeof r[key] === "string" && /^#[0-9a-f]{6}$/i.test(r[key] as string))
      o[key] = r[key] as string;
  }
  if (["square", "rounded", "dots"].includes(String(r.style)))
    o.style = String(r.style);
  if (["L", "M", "Q", "H"].includes(String(r.ecc)))
    o.ecc = r.ecc as Options["ecc"];
  for (const [key, min, max] of [
    ["margin", 4, 16],
    ["iconSize", 10, 22],
    ["barHeight", 5, 100],
  ] as const) {
    if (typeof r[key] === "number" && r[key] >= min && r[key] <= max)
      o[key] = r[key];
  }
  if ([256, 512, 1024, 2048, 4096].includes(Number(r.size)))
    o.size = Number(r.size);
  o.transparent = r.transparent === true;
  o.showText = r.showText !== false;
  o.caption = typeof r.caption === "string" ? r.caption.slice(0, 60) : "";
  o.icon =
    typeof r.icon === "string" && /^[a-z0-9]+$/.test(r.icon) ? r.icon : "";
  return o;
}
type Preset = { name: string; style: Options };
function getPresets(): Preset[] {
  try {
    const p = JSON.parse(localStorage.getItem("code-studio-styles") || "[]");
    return Array.isArray(p)
      ? p
          .filter((x) => x && typeof x.name === "string" && x.style)
          .map((x) => ({
            name: x.name.slice(0, 40),
            style: validatedStyle(x.style),
          }))
          .slice(0, 30)
      : [];
  } catch {
    return [];
  }
}
function renderPresets() {
  const p = getPresets();
  $("#presets").innerHTML = p.length
    ? p
        .map(
          (x, i) =>
            `<div><button data-preset="${i}" class="quiet">${escapeXml(x.name)}</button><button data-delete="${i}" class="text-button" aria-label="Delete ${escapeXml(x.name)} style">×</button></div>`,
        )
        .join("")
    : '<p class="hint">No saved styles yet. Save your colours and settings here.</p>';
}
$("#savePreset").onclick = () => {
  try {
    const name = $<HTMLInputElement>("#presetName").value.trim();
    if (!name) {
      notify("Enter a name for your style.");
      $("#presetName").focus();
      return;
    }
    const p = getPresets(),
      style = { ...currentOptions(), logo: "", caption: "" };
    const existing = p.findIndex((x) => x.name === name);
    if (existing >= 0) p[existing] = { name, style };
    else p.push({ name, style });
    if (p.length > 30)
      throw Error("You can save up to 30 styles. Delete one first.");
    localStorage.setItem("code-studio-styles", JSON.stringify(p));
    renderPresets();
    notify("Style saved on this browser.");
  } catch (e) {
    notify(e instanceof Error ? e.message : "Browser storage is unavailable.");
  }
};
$("#presets").onclick = (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!b) return;
  const p = getPresets();
  if (b.dataset.preset !== undefined)
    applyStyle(p[Number(b.dataset.preset)].style);
  else {
    try {
      const index = Number(b.dataset.delete);
      const deleted = p.splice(index, 1)[0];
      localStorage.setItem("code-studio-styles", JSON.stringify(p));
      renderPresets();
      notify(`Deleted style “${deleted.name}”.`);
    } catch {
      notify("Could not update browser storage.");
    }
  }
};
$("#exportSettings").onclick = () => {
  try {
    download(
      new Blob(
        [
          JSON.stringify(
            { ...currentOptions(), logo: "", caption: "" },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
      "code-studio-style.json",
    );
  } catch (e) {
    notify(String(e));
  }
};
$<HTMLInputElement>("#importSettings").onchange = async (e) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  try {
    if (f.size > 20000) throw Error("Style JSON must be under 20 KB.");
    applyStyle(validatedStyle(JSON.parse(await f.text())));
    notify("Style imported.");
  } catch (e) {
    notify(e instanceof Error ? e.message : "Invalid JSON style.");
  }
};
$("#resetStyle").onclick = () => {
  applyStyle({ ...defaults });
  notify("Style reset. Your content is unchanged.");
};
let batchCancelled = false;
$<HTMLInputElement>("#csvUpload").onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 1024 * 1024) {
    notify("CSV must be under 1 MB.");
    return;
  }
  $<HTMLTextAreaElement>("#batchValues").value = await file.text();
  notify("CSV loaded. Review values before exporting.");
};
$("#cancelBatch").onclick = () => {
  batchCancelled = true;
};
$("#batchDownload").onclick = async () => {
  if (busy) return;
  try {
    const raw = $<HTMLTextAreaElement>("#batchValues").value.trim();
    if (!raw) throw Error("Add batch values or import a CSV first.");
    const isCsv = /^\s*"?value"?\s*,/i.test(raw);
    let rows = isCsv
      ? parseCSV(raw)
      : raw
          .split(/\r?\n/)
          .filter(Boolean)
          .map((s) => [s]);
    if (isCsv) rows = rows.slice(1);
    if (!rows.length || rows.length > 200)
      throw Error("Use between 1 and 200 batch values.");
    busy = true;
    batchCancelled = false;
    $<HTMLButtonElement>("#batchDownload").disabled = true;
    $("#cancelBatch").hidden = false;
    const o = currentOptions(),
      batchMode = mode,
      sym = $<HTMLSelectElement>("#barcodeType").value,
      files: Record<string, Uint8Array> = {};
    const errors: string[] = [];
    const { zipSync } = await import("fflate");
    for (let i = 0; i < rows.length; i++) {
      if (batchCancelled) break;
      $("#batchStatus").textContent = `${i + 1} / ${rows.length}`;
      try {
        const data = await generateSvg(rows[i][0], batchMode, sym, o);
        const blob = await rasterize(data, Math.min(o.size, 2048));
        files[
          `${String(i + 1).padStart(3, "0")}-${safeFilename(rows[i][1] || "code")}.png`
        ] = new Uint8Array(await blob.arrayBuffer());
      } catch (e) {
        errors.push(
          `Row ${i + 1}: ${e instanceof Error ? e.message : "Invalid value"}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    if (batchCancelled) {
      notify("Batch cancelled. No archive downloaded.");
      return;
    }
    if (errors.length)
      files["errors.txt"] = new TextEncoder().encode(errors.join("\n"));
    if (!Object.keys(files).some((x) => x.endsWith(".png")))
      throw Error(errors[0] || "No valid codes.");
    const zipped = zipSync(files, { level: 0 });
    download(
      new Blob([new Uint8Array(zipped)], { type: "application/zip" }),
      "code-studio-batch.zip",
    );
    $("#batchStatus").textContent = errors.length
      ? `${errors.length} invalid rows — see errors.txt`
      : "Batch ready";
    notify("Batch ZIP downloaded.");
  } catch (e) {
    notify(e instanceof Error ? e.message : "Batch export failed.");
  } finally {
    busy = false;
    $<HTMLButtonElement>("#batchDownload").disabled = false;
    $("#cancelBatch").hidden = true;
    void update();
  }
};
$("#help").onclick = () => $<HTMLDialogElement>("#about").showModal();
$("#closeAbout").onclick = () => $<HTMLDialogElement>("#about").close();
renderFields();
renderPresets();
void loadIcons();
void update();
