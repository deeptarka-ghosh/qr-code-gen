import QRCode from "qrcode";
import { escapeXml } from "./content";
export interface Options {
  foreground: string;
  background: string;
  transparent: boolean;
  size: number;
  margin: number;
  style: string;
  ecc: "L" | "M" | "Q" | "H";
  icon: string;
  iconColor: string;
  iconSize: number;
  logo: string;
  caption: string;
  barHeight: number;
  showText: boolean;
}
export const defaults: Options = {
  foreground: "#173f35",
  background: "#ffffff",
  transparent: false,
  size: 1024,
  margin: 4,
  style: "square",
  ecc: "H",
  icon: "",
  iconColor: "#173f35",
  iconSize: 18,
  logo: "",
  caption: "",
  barHeight: 18,
  showText: true,
};
export const barcodeTypes = [
  ["code128", "Code 128"],
  ["code39", "Code 39"],
  ["code93", "Code 93"],
  ["ean13", "EAN-13"],
  ["ean8", "EAN-8"],
  ["upca", "UPC-A"],
  ["upce", "UPC-E"],
  ["interleaved2of5", "Interleaved 2 of 5"],
  ["itf14", "ITF-14"],
  ["rationalizedCodabar", "Codabar"],
  ["gs1-128", "GS1-128"],
  ["datamatrix", "Data Matrix"],
  ["pdf417", "PDF417"],
  ["azteccode", "Aztec"],
];
let iconModule: Promise<typeof import("./icons")> | undefined;
export async function generateSvg(
  text: string,
  mode: "qr" | "barcode",
  symbology: string,
  o: Options,
): Promise<string> {
  if (!text.trim()) throw Error("Enter content to generate a code.");
  if (mode === "barcode") {
    const bwip = (await import("bwip-js/browser")).default;
    let svg = bwip.toSVG({
      bcid: symbology,
      text,
      scale: 3,
      height: o.barHeight,
      includetext: o.showText,
      textxalign: "center",
      barcolor: o.foreground.slice(1),
      textcolor: o.foreground.slice(1),
      paddingwidth: 12,
      paddingheight: 12,
      ...(!o.transparent ? { backgroundcolor: o.background.slice(1) } : {}),
    });
    if (o.caption) {
      const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      if (vb) {
        const w = Number(vb[1]),
          h = Number(vb[2]);
        svg = svg
          .replace(/viewBox="[^"]+"/, `viewBox="0 0 ${w} ${h + 32}"`)
          .replace(/height="[^"]+"/, `height="${h + 32}"`)
          .replace(
            "</svg>",
            `${!o.transparent ? `<rect x="0" y="${h}" width="${w}" height="32" fill="${o.background}"/>` : ""}<text x="${w / 2}" y="${h + 21}" text-anchor="middle" font-family="sans-serif" font-size="15" fill="${o.foreground}">${escapeXml(o.caption)}</text></svg>`,
          );
      }
    }
    return svg;
  }
  const qr = QRCode.create(text, { errorCorrectionLevel: o.ecc });
  const n = qr.modules.size,
    m = o.margin,
    side = n + 2 * m,
    extra = o.caption ? 8 : 0;
  let shapes = "";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (!qr.modules.get(y, x)) continue;
      const finder =
        (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      shapes +=
        o.style === "dots" && !finder
          ? `<circle cx="${x + m + 0.5}" cy="${y + m + 0.5}" r=".48"/>`
          : `<rect x="${x + m}" y="${y + m}" width="1" height="1"${o.style === "rounded" && !finder ? ' rx=".25"' : ""}/>`;
    }
  let overlay = "";
  if (o.icon || o.logo) {
    const width = (n * o.iconSize) / 100;
    const x = (side - width) / 2;
    const plate = width + 2;
    overlay = `<rect x="${x - 1}" y="${x - 1}" width="${plate}" height="${plate}" rx="1.2" fill="${o.background}"/>`;
    if (o.logo)
      overlay += `<image href="${escapeXml(o.logo)}" x="${x}" y="${x}" width="${width}" height="${width}" preserveAspectRatio="xMidYMid meet"/>`;
    else {
      iconModule ??= import("./icons");
      const icons = await iconModule;
      const path = icons.socialIcons.find((i) => i.id === o.icon)?.path;
      if (path)
        overlay += `<path d="${path}" transform="translate(${x} ${x}) scale(${width / 24})" fill="${o.iconColor}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side + extra}" viewBox="0 0 ${side} ${side + extra}">${!o.transparent ? `<rect width="100%" height="100%" fill="${o.background}"/>` : ""}<g fill="${o.foreground}">${shapes}</g>${overlay}${o.caption ? `<text x="${side / 2}" y="${side + 5}" text-anchor="middle" font-family="sans-serif" font-size="3" fill="${o.foreground}">${escapeXml(o.caption)}</text>` : ""}</svg>`;
}
export async function rasterize(
  svg: string,
  size: number,
  type = "image/png",
): Promise<Blob> {
  const blob = new Blob([svg], { type: "image/svg+xml" }),
    url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(
          Error("Could not render the image. Try removing the uploaded logo."),
        );
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = Math.max(
      1,
      Math.round((size * image.height) / image.width),
    );
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("Your browser does not support image export.");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(Error("Image export failed."))),
        type,
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
