import { jsPDF } from 'jspdf';
import type { GrabbitOrderWithItems } from '@gradient365/gradient-commons';

// jsPDF's built-in fonts have no ₹ glyph (renders as a missing-box), so
// amounts use "Rs." here instead of the inr() helper used on-screen.
const rs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`;

const PAGE_W = 595.28; // A4 at 72dpi
const MARGIN = 40;
const RIGHT = PAGE_W - MARGIN;
const AMBER: [number, number, number] = [255, 177, 0];
const INK: [number, number, number] = [36, 22, 18];
const LINE: [number, number, number] = [225, 217, 205];
const MUTED: [number, number, number] = [122, 110, 96];

/**
 * Order receipt in the spirit of the Blinkit/Zomato reference layouts (bordered
 * header block, boxed item table, bold total) but explicitly NOT a GST tax
 * invoice: no HSN codes or CGST/SGST breakdown, since whether a cafe charges
 * GST at all varies per cafe and isn't fully modeled here. FSSAI/GSTIN print
 * when the cafe has them on file, same placement Blinkit uses (right under
 * the seller block).
 */
export function downloadReceipt(order: GrabbitOrderWithItems, cafeName: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 0;

  // ---- header band ----
  doc.setFillColor(...AMBER);
  doc.rect(0, 0, PAGE_W, 92, 'F');
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Grabbit', MARGIN, 40);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Order Receipt', MARGIN, 58);
  doc.setFontSize(9);
  doc.text(`GB-${order.id}`, RIGHT, 40, { align: 'right' });
  doc.text(
    new Date(order.created_at).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    RIGHT, 58, { align: 'right' },
  );
  y = 92 + 28;

  // ---- seller / buyer block (bordered, two columns) ----
  const blockTop = y;
  const blockH = 92;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.rect(MARGIN, blockTop, RIGHT - MARGIN, blockH);
  doc.line((MARGIN + RIGHT) / 2, blockTop, (MARGIN + RIGHT) / 2, blockTop + blockH);

  const colL = MARGIN + 14;
  const colR = (MARGIN + RIGHT) / 2 + 14;
  let yl = blockTop + 20;
  let yr = blockTop + 20;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
  doc.text('SOLD BY', colL, yl); yl += 14;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...INK);
  doc.text(cafeName, colL, yl); yl += 16;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MUTED);
  if (order.cafe_fssai_number) { doc.text(`FSSAI: ${order.cafe_fssai_number}`, colL, yl); yl += 13; }
  if (order.cafe_gstin) { doc.text(`GSTIN: ${order.cafe_gstin}`, colL, yl); yl += 13; }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
  doc.text('BILLED TO', colR, yr); yr += 14;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...INK);
  doc.text(order.customer_name || 'Guest', colR, yr); yr += 16;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MUTED);
  if (order.customer_phone) { doc.text(order.customer_phone, colR, yr); yr += 13; }
  doc.text(`Paid via ${order.payment_method === 'online' ? 'online payment' : 'counter payment'}`, colR, yr);

  y = blockTop + blockH + 26;

  // ---- item table ----
  const colItemX = MARGIN + 10;
  const colQtyX = RIGHT - 150;
  const colAmtX = RIGHT - 10;
  const rowH = 24;

  doc.setFillColor(...INK);
  doc.rect(MARGIN, y, RIGHT - MARGIN, rowH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('ITEM', colItemX, y + 15.5);
  doc.text('QTY', colQtyX, y + 15.5, { align: 'right' });
  doc.text('AMOUNT', colAmtX, y + 15.5, { align: 'right' });
  y += rowH;

  doc.setFont('helvetica', 'normal'); doc.setTextColor(...INK);
  for (const item of order.items) {
    const lineTotal = item.unit_price * item.quantity + (item.addons_total ?? 0);
    const hasAddons = item.addons && item.addons.length > 0;
    const thisRowH = hasAddons ? rowH + 12 : rowH;

    doc.setFontSize(10);
    doc.text(item.menu_item_name, colItemX, y + 15.5, { maxWidth: colQtyX - colItemX - 20 });
    doc.text(String(item.quantity), colQtyX, y + 15.5, { align: 'right' });
    doc.text(rs(lineTotal), colAmtX, y + 15.5, { align: 'right' });
    if (hasAddons) {
      doc.setFontSize(8.5); doc.setTextColor(...MUTED);
      doc.text(`+ ${item.addons!.map(a => a.name).join(', ')}`, colItemX, y + 28);
      doc.setTextColor(...INK);
    }
    y += thisRowH;
    doc.setDrawColor(...LINE);
    doc.line(MARGIN, y, RIGHT, y);
  }

  // total row
  doc.setFillColor(250, 246, 238);
  doc.rect(MARGIN, y, RIGHT - MARGIN, 30, 'F');
  doc.setDrawColor(...LINE);
  doc.rect(MARGIN, y, RIGHT - MARGIN, 30);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Total paid', colItemX, y + 19.5);
  doc.text(rs(order.total_amount), colAmtX, y + 19.5, { align: 'right' });
  y += 30 + 26;

  // ---- footer ----
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
  doc.text('This is an order receipt, not a GST tax invoice.', MARGIN, y);
  y += 13;
  doc.text('Thanks for ordering on Grabbit.', MARGIN, y);

  doc.save(`grabbit-order-GB-${order.id}.pdf`);
}
