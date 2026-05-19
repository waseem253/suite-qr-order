/**
 * Generates the 86 room QR codes — one PNG per room plus a single
 * print-ready PDF sheet (one labelled QR per page, sized for a room
 * card). Each QR encodes BASE_URL/room/<number> so the guest scans and
 * lands directly on their room — they never type a number.
 *
 *   node scripts/gen-qr.mjs https://your-domain.mt
 *
 * Output: ./qrcodes/room-<n>.png  and  ./qrcodes/all-rooms.pdf
 */
import { mkdirSync, createWriteStream } from "node:fs";
import { join } from "node:path";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

const BASE = (process.argv[2] || process.env.NEXT_PUBLIC_BASE_URL || "https://example-hotel.mt").replace(/\/$/, "");

// 86 rooms across 4 floors (realistic Maltese boutique-hotel layout).
const LAYOUT = [
  [1, 22],
  [2, 22],
  [3, 22],
  [4, 20],
];
const rooms = [];
for (const [floor, count] of LAYOUT) {
  for (let i = 1; i <= count; i++) rooms.push(`${floor}${String(i).padStart(2, "0")}`);
}

const outDir = join(process.cwd(), "qrcodes");
mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({ size: "A6", margin: 24 });
doc.pipe(createWriteStream(join(outDir, "all-rooms.pdf")));

let first = true;
for (const room of rooms) {
  const url = `${BASE}/room/${room}`;
  const pngPath = join(outDir, `room-${room}.png`);
  await QRCode.toFile(pngPath, url, {
    width: 600,
    margin: 1,
    color: { dark: "#211d18", light: "#fffdf9" },
  });

  if (!first) doc.addPage();
  first = false;
  const png = await QRCode.toBuffer(url, { width: 360, margin: 1, color: { dark: "#211d18", light: "#fffdf9" } });
  doc.fontSize(11).fillColor("#7a7268").text("IN-ROOM SERVICE", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(26).fillColor("#211d18").text(`Room ${room}`, { align: "center" });
  doc.moveDown(0.5);
  const x = (doc.page.width - 180) / 2;
  doc.image(png, x, doc.y, { width: 180 });
  doc.moveDown(13);
  doc.fontSize(8).fillColor("#7a7268").text("Scan to order — Food & Beverage · Adventure · Taxi", { align: "center" });
}

doc.end();
console.log(`Generated ${rooms.length} room QRs → ${outDir}`);
console.log(`Base URL: ${BASE}`);
