// XP seriyali (Xprinter) termal chek printerlari uchun 80mm kengligidagi chek chop etish.
// Printer Windows tizimida oddiy printer sifatida o'rnatilgan bo'lishi kerak (drayveri orqali);
// bu funksiya brauzerning standart chop etish oynasini o'sha printer bilan avtomatik ochadi.

const PAYMENT_TYPE_LABELS = {
  CASH: 'Naqd',
  CARD: 'Karta',
  TRANSFER: "O'tkazma",
  CLICK: 'Click/Payme',
};

const formatMoney = (value) => Math.round(Number(value) || 0).toLocaleString('uz-UZ').replace(/,/g, ' ');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const printPaymentReceipt = (payment) => {
  const {
    id,
    studentName,
    groupName,
    teacherName,
    month,
    amount,
    discount = 0,
    penalty = 0,
    paymentType,
    paymentDate,
    comment,
    cashierName,
  } = payment;

  const total = Number(amount) - Number(discount || 0) + Number(penalty || 0);
  const paymentTypeLabel = PAYMENT_TYPE_LABELS[paymentType] || paymentType || '';
  const now = new Date();
  const printedAt = now.toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const monthLabel = month
    ? new Date(`${month}-01`).toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })
    : '';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Chek</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-scheme: only light;
  }
  html, body { background: #fff; }
  body {
    width: 72mm;
    margin: 0 auto;
    padding: 3mm 4mm 6mm;
    font-family: 'Courier New', Consolas, monospace;
    font-weight: 700;
    font-size: 13px;
    line-height: 1.5;
    color: #000;
    -webkit-font-smoothing: none;
  }
  .center { text-align: center; }
  .bold { font-weight: 900; }
  .brand { font-size: 18px; letter-spacing: 1px; }
  .sub { font-size: 12px; }
  .divider { border-top: 2px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; gap: 8px; }
  .row .label { color: #000; }
  .total-row { font-size: 15px; font-weight: 900; }
  .footer { margin-top: 8px; font-size: 12px; }
  .small { font-size: 11px; color: #000; }
</style>
</head>
<body>
  <div class="center brand bold">UITS</div>
  <div class="center sub">O'quv markazi</div>
  <div class="center sub bold" style="margin-top:4px;">TO'LOV CHEKI</div>
  <div class="divider"></div>

  <div class="row small">
    <span>Chek raqami:</span>
    <span>#${escapeHtml(id ?? '-')}</span>
  </div>
  <div class="row small">
    <span>Sana:</span>
    <span>${escapeHtml(printedAt)}</span>
  </div>

  <div class="divider"></div>

  <div class="row"><span class="label">O'quvchi:</span></div>
  <div class="bold">${escapeHtml(studentName || "Noma'lum")}</div>

  <div class="row" style="margin-top:4px;"><span class="label">Guruh:</span><span>${escapeHtml(groupName || '-')}</span></div>
  <div class="row"><span class="label">O'qituvchi:</span><span>${escapeHtml(teacherName || '-')}</span></div>
  <div class="row"><span class="label">Hisobot oyi:</span><span>${escapeHtml(monthLabel)}</span></div>

  <div class="divider"></div>

  <div class="row"><span>Asosiy summa:</span><span>${formatMoney(amount)}</span></div>
  ${Number(discount) > 0 ? `<div class="row"><span>Chegirma:</span><span>-${formatMoney(discount)}</span></div>` : ''}
  ${Number(penalty) > 0 ? `<div class="row"><span>Jarima:</span><span>+${formatMoney(penalty)}</span></div>` : ''}

  <div class="divider"></div>

  <div class="row total-row"><span>JAMI TO'LANDI:</span><span>${formatMoney(total)} UZS</span></div>

  <div class="divider"></div>

  <div class="row small"><span>To'lov turi:</span><span>${escapeHtml(paymentTypeLabel)}</span></div>
  <div class="row small"><span>To'lov sanasi:</span><span>${escapeHtml(paymentDate || '-')}</span></div>
  ${cashierName ? `<div class="row small"><span>Qabul qildi:</span><span>${escapeHtml(cashierName)}</span></div>` : ''}
  ${comment ? `<div class="small" style="margin-top:4px;">Izoh: ${escapeHtml(comment)}</div>` : ''}

  <div class="divider"></div>
  <div class="center footer">Xaridingiz uchun rahmat!</div>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  const triggerPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.onafterprint = cleanup;
      iframe.contentWindow.print();
    } finally {
      // Ba'zi brauzerlarda 'afterprint' ishlamasligi mumkin — zaxira tozalash
      setTimeout(cleanup, 5000);
    }
  };

  // Handler doc.write'dan OLDIN o'rnatiladi — ba'zi brauzerlarda 'load'
  // hodisasi write/close paytida darhol otilib ketishi mumkin, shu sabab
  // keyin biriktirilgan handler ishlamay qolishi (va chek bo'sh chiqishi) mumkin edi.
  iframe.onload = triggerPrint;
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
};
