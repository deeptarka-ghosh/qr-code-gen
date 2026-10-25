export type ContentKind =
  | "url"
  | "text"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "contact"
  | "location"
  | "upi"
  | "event";
export const escapeXml = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
const cardEscape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, "\\$&");
export function payload(kind: ContentKind, f: Record<string, string>): string {
  const v = (k: string) => f[k]?.trim() || "";
  const requireValue = (k: string, label: string) => {
    if (!v(k)) throw Error(`Enter ${label}.`);
    return v(k);
  };
  switch (kind) {
    case "url": {
      const u = requireValue("value", "a website address");
      let parsed: URL;
      try {
        parsed = new URL(u);
      } catch {
        throw Error("Enter a complete URL, including https://.");
      }
      if (!["http:", "https:"].includes(parsed.protocol))
        throw Error("Use an http:// or https:// website address.");
      return u;
    }
    case "text":
      return requireValue("value", "some text");
    case "wifi":
      return `WIFI:T:${v("security") || "WPA"};S:${wifiEscape(requireValue("ssid", "a network name"))};P:${wifiEscape(f.password || "")};H:${v("hidden") === "true"};;`;
    case "email": {
      const email = requireValue("email", "an email address");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw Error("Enter a valid email address.");
      return `mailto:${email}?subject=${encodeURIComponent(v("subject"))}&body=${encodeURIComponent(v("message"))}`;
    }
    case "phone":
      return `tel:${requireValue("phone", "a phone number")}`;
    case "sms":
      return `SMSTO:${requireValue("phone", "a phone number")}:${v("message")}`;
    case "whatsapp": {
      const phone = requireValue("phone", "a phone number").replace(
        /[^0-9]/g,
        "",
      );
      if (phone.length < 7)
        throw Error("Include the country code and a valid phone number.");
      return `https://wa.me/${phone}?text=${encodeURIComponent(v("message"))}`;
    }
    case "contact":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${cardEscape(requireValue("name", "a contact name"))}`,
        `ORG:${cardEscape(v("company"))}`,
        `TEL:${cardEscape(v("phone"))}`,
        `EMAIL:${cardEscape(v("email"))}`,
        `URL:${cardEscape(v("website"))}`,
        "END:VCARD",
      ].join("\r\n");
    case "location": {
      const lat = Number(requireValue("latitude", "a latitude")),
        lon = Number(requireValue("longitude", "a longitude"));
      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
      )
        throw Error("Latitude must be −90 to 90; longitude −180 to 180.");
      return `geo:${lat},${lon}`;
    }
    case "upi": {
      const id = requireValue("upi", "a UPI ID");
      if (!/^[^\s@]+@[^\s@]+$/.test(id))
        throw Error("Enter a UPI ID such as name@bank.");
      const params = new URLSearchParams({
        pa: id,
        pn: requireValue("name", "a recipient name"),
        cu: "INR",
      });
      if (v("amount")) {
        if (!/^\d+(\.\d{1,2})?$/.test(v("amount")) || Number(v("amount")) <= 0)
          throw Error(
            "Enter an amount greater than zero, with up to two decimal places.",
          );
        params.set("am", v("amount"));
      }
      if (v("note")) params.set("tn", v("note"));
      return `upi://pay?${params}`;
    }
    case "event": {
      const start = requireValue("start", "a start time"),
        end = requireValue("end", "an end time");
      if (new Date(end) <= new Date(start))
        throw Error("The event end must be after its start.");
      const stamp = (s: string) =>
        new Date(s)
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Code Studio//EN",
        "BEGIN:VEVENT",
        `UID:${crypto.randomUUID()}@code-studio`,
        `DTSTAMP:${stamp(new Date().toISOString())}`,
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(end)}`,
        `SUMMARY:${cardEscape(requireValue("title", "an event title"))}`,
        `LOCATION:${cardEscape(v("location"))}`,
        `DESCRIPTION:${cardEscape(v("description"))}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
    }
  }
}
export function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const n = hex.replace("#", "");
    const c = [0, 2, 4]
      .map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const x = lum(a),
    y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function safeFilename(s: string) {
  return (
    s
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "code-studio"
  );
}
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (!quoted && cell.length)
        throw Error("Unexpected quote in CSV.");
      else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw Error("CSV has an unclosed quoted field.");
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
