import { jsPDF } from 'jspdf';
import type { GrabbitOrderWithItems } from '@gradient365/gradient-commons';

// jsPDF's built-in fonts have no ₹ glyph (renders as a missing-box), so
// amounts use "Rs." here instead of the inr() helper used on-screen.
const rs = (n: number) => `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const round2 = (n: number) => Math.round(n * 100) / 100;

// 80mm thermal roll, the width the cafe's own printer uses. The page grows with the
// order rather than sitting on a fixed A4 sheet with white space under it.
const PAGE_W = 226.77;
const MARGIN = 14;
const RIGHT = PAGE_W - MARGIN;
const INK: [number, number, number] = [0, 0, 0];
const MUTED: [number, number, number] = [90, 90, 90];
const RULE: [number, number, number] = [170, 170, 170];

const LINE_H = 11;
const ROW_H = 12;

// Right edges of the three number columns, measured back from the margin. At 80mm
// there is no room to guess: "Rs. 160.00" is ~44pt at this size, so the columns are
// pitched to clear each other rather than laid out by eye.
const COL_QTY = 100;
const COL_RATE = 52;
const NAME_W = 92;

/**
 * The customer's copy of the cafe's own bill.
 *
 * Deliberately the same document as the POS prints (omegaservice ReceiptController):
 * same monospace column, same section order, same wording, same tax split. A customer
 * who orders at the counter one day and through Grabbit the next should get one bill,
 * not two that look like they came from different companies. The header block and
 * boxed table this used to draw were a second design maintained for no reason.
 *
 * Not a GST tax invoice - no HSN codes - but it carries the cafe's GSTIN, FSSAI and
 * the CGST/SGST already inside the price, which is what a customer needs from it.
 */
export function downloadReceipt(order: GrabbitOrderWithItems, cafeName: string) {
  // Drawn twice: once on a throwaway page to find where the content ends, then for real
  // on a page cut to exactly that. A receipt roll ends where the bill ends - estimating
  // the height instead leaves the customer with a strip of blank paper under the total.
  const { end } = render(order, cafeName, new jsPDF({ unit: 'pt', format: [PAGE_W, 2000] }));
  // jsPDF's portrait mode sorts the format so the width is the shorter side. A one-item
  // bill is shorter than the roll is wide, so [226.77, 208] came back as a 208pt-wide page
  // and the AMOUNT column was cut off the right edge. Never let the page be shorter than
  // it is wide; a stub bill carries a little blank tail instead of losing a column.
  const height = Math.max(end, PAGE_W);
  const { doc } = render(order, cafeName, new jsPDF({ unit: 'pt', format: [PAGE_W, height] }));
  doc.save(`grabbit-order-GB-${order.id}.pdf`);
}

function render(order: GrabbitOrderWithItems, cafeName: string, doc: jsPDF): { doc: jsPDF; end: number } {
  const gstRate = Number(order.cafe_gst_rate ?? 0);
  const taxed = gstRate > 0;
  let y = MARGIN + 10;

  const centre = (text: string, size: number, bold = false, colour = INK) => {
    doc.setFont('courier', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...colour);
    doc.text(text, PAGE_W / 2, y, { align: 'center' });
    y += LINE_H;
  };

  const rule = (dashed = true) => {
    doc.setDrawColor(...(dashed ? RULE : INK));
    doc.setLineWidth(dashed ? 0.5 : 1);
    if (dashed) doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(MARGIN, y, RIGHT, y);
    doc.setLineDashPattern([], 0);
    y += 8;
  };

  const row = (label: string, amount: string, bold = false, size = 7.5) => {
    doc.setFont('courier', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...INK);
    doc.text(label, MARGIN, y);
    doc.text(amount, RIGHT, y, { align: 'right' });
    y += LINE_H;
  };

  // ---- who sold it ----
  centre(cafeName, 9.5, true);
  if (order.cafe_gstin) centre(`GSTIN: ${order.cafe_gstin}`, 6.5, false, MUTED);
  if (order.cafe_fssai_number) centre(`FSSAI: ${order.cafe_fssai_number}`, 6.5, false, MUTED);
  y += 3;

  const placed = new Date(order.created_at).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  centre(`Order GB-${order.id} - ${placed}`, 6.5, false, MUTED);
  centre(`${order.customer_name || 'Guest'}${order.customer_phone ? ` - ${order.customer_phone}` : ''}`, 6.5, false, MUTED);
  y += 4;

  // ---- what they bought ----
  rule();
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text('ITEM', MARGIN, y);
  doc.text('QTY', RIGHT - COL_QTY, y, { align: 'right' });
  doc.text('RATE', RIGHT - COL_RATE, y, { align: 'right' });
  doc.text('AMOUNT', RIGHT, y, { align: 'right' });
  y += LINE_H;
  rule();

  for (const item of order.items) {
    const lineTotal = item.unit_price * item.quantity + (item.addons_total ?? 0);
    const nameLines = doc.splitTextToSize(item.menu_item_name, NAME_W).length;
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...INK);
    doc.text(item.menu_item_name, MARGIN, y, { maxWidth: NAME_W });
    doc.text(String(item.quantity), RIGHT - COL_QTY, y, { align: 'right' });
    doc.text(rs(item.unit_price), RIGHT - COL_RATE, y, { align: 'right' });
    doc.text(rs(lineTotal), RIGHT, y, { align: 'right' });
    y += ROW_H + (nameLines - 1) * (LINE_H - 2);
    if (item.addons && item.addons.length > 0) {
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text(`+ ${item.addons.map(a => a.name).join(', ')}`, MARGIN + 6, y);
      y += LINE_H;
    }
  }

  // ---- what it cost ----
  rule();
  if (taxed) {
    // The price already contains the GST, so the bill shows the value it was carved
    // out of and the two halves. Same arithmetic as the POS bill, down to the odd
    // paisa going to SGST, so the two documents agree to the last rupee.
    const taxable = round2(order.total_amount / (1 + gstRate / 100));
    const gst = round2(order.total_amount - taxable);
    const cgst = Math.floor((gst / 2) * 100) / 100;
    const halfPct = String(Math.round((gstRate / 2) * 100) / 100);
    row('Taxable value', rs(taxable));
    row(`CGST @ ${halfPct}%`, rs(cgst));
    row(`SGST @ ${halfPct}%`, rs(round2(gst - cgst)));
  } else {
    row('Subtotal', rs(order.total_amount));
  }

  y += 2;
  rule(false);
  row('Total', rs(order.total_amount), true, 9);
  if (taxed) centre('(Inclusive of all taxes)', 6.5, false, MUTED);
  y += 4;

  // ---- how it was paid ----
  rule();
  row(order.payment_method === 'online' ? 'PAID ONLINE' : 'PAY AT COUNTER', rs(order.total_amount));
  y += 6;

  centre('Thanks for ordering on Grabbit.', 6.5, false, MUTED);

  return { doc, end: y - LINE_H + MARGIN };
}
