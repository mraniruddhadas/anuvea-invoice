/* ===== ANUVÉA DIGITAL SALES INVOICE — script.js ===== */

/* ---- Auto-calculate product rows ---- */
function calcRow(rowIndex) {
  const qty  = parseFloat(document.getElementById('qty_'  + rowIndex).value)  || 0;
  const rate = parseFloat(document.getElementById('rate_' + rowIndex).value) || 0;
  const amt  = qty * rate;
  const amtCell = document.getElementById('amt_' + rowIndex);
  amtCell.textContent = amt > 0 ? '₹' + amt.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2}) : '';
  calcTotals();
}

function calcTotals() {
  let totalQty = 0;
  let totalAmt = 0;
  for (let i = 1; i <= 10; i++) {
    totalQty += parseFloat(document.getElementById('qty_'  + i).value)  || 0;
    const rate = parseFloat(document.getElementById('rate_' + i).value) || 0;
    const qty  = parseFloat(document.getElementById('qty_'  + i).value)  || 0;
    totalAmt += qty * rate;
  }
  document.getElementById('total_qty').textContent = totalQty > 0 ? totalQty : '';
  document.getElementById('total_amt').textContent = totalAmt > 0
    ? '₹' + totalAmt.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2})
    : '';
}

/* ---- Show toast ---- */
function showToast(msg, duration) {
  duration = duration || 2800;
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, duration);
}

/* ---- Collect form data ---- */
function collectData() {
  const data = {
    billNo     : document.getElementById('bill_no').textContent  || '',
    date       : document.getElementById('inv_date').value       || '',
    memberName : document.getElementById('member_name').value.trim(),
    village    : document.getElementById('village').value.trim(),
    pinCode    : document.getElementById('pin_code').value.trim(),
    whatsapp   : document.getElementById('whatsapp').value.trim(),
    payment    : (document.querySelector('input[name="payment"]:checked') || {}).value || '',
    partner    : document.getElementById('partner_name').value.trim(),
    rows       : [],
    totalQty   : 0,
    totalAmt   : 0
  };

  for (let i = 1; i <= 10; i++) {
    const prod = document.getElementById('prod_'  + i).value.trim();
    const qty  = parseFloat(document.getElementById('qty_'  + i).value)  || 0;
    const rate = parseFloat(document.getElementById('rate_' + i).value) || 0;
    const amt  = qty * rate;
    data.rows.push({ sl: i, prod, qty, rate, amt });
    data.totalQty += qty;
    data.totalAmt += amt;
  }

  return data;
}

/* ---- Validate ---- */
function validateForm() {
  let ok = true;
  const fields = [
    { id: 'member_name', label: 'Member Name' },
    { id: 'village',     label: 'Village'      },
    { id: 'whatsapp',    label: 'WhatsApp No.' },
    { id: 'partner_name', label: 'Community Partner Name' }
  ];

  fields.forEach(function(f) {
    const el = document.getElementById(f.id);
    el.classList.remove('error-field');
    if (!el.value.trim()) {
      el.classList.add('error-field');
      ok = false;
    }
  });

  const data = collectData();
  const hasProduct = data.rows.some(function(r) { return r.prod && r.qty > 0 && r.rate > 0; });
  if (!hasProduct) {
    showToast('⚠️ Add at least one product with quantity and rate');
    ok = false;
  }

  if (!data.payment) {
    showToast('⚠️ Please select a payment mode');
    ok = false;
  }

  if (!ok && !data.payment && hasProduct) {
    showToast('⚠️ Please fill all required fields');
  } else if (!ok && !hasProduct) {
    // already shown
  } else if (!ok) {
    showToast('⚠️ Please fill all required fields');
  }

  return ok;
}

/* ---- Generate Bill Number ---- */
function generateBillNo() {
  const now = new Date();
  const pad = function(n, w) { return String(n).padStart(w, '0'); };
  const yr  = now.getFullYear();
  const mo  = pad(now.getMonth() + 1, 2);
  const dy  = pad(now.getDate(), 2);
  const hr  = pad(now.getHours(), 2);
  const mn  = pad(now.getMinutes(), 2);
  const sc  = pad(now.getSeconds(), 2);
  return 'ANU-' + yr + mo + dy + '-' + hr + mn + sc;
}

/* ---- Build PDF HTML ---- */
function buildPdfHtml(data, logoDataUrl) {
  var rows = '';
  data.rows.forEach(function(r) {
    var amt = r.amt > 0 ? '₹' + r.amt.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2}) : '';
    var qty  = r.qty  > 0 ? r.qty  : '';
    var rate = r.rate > 0 ? '₹' + r.rate : '';
    rows += '<tr><td class="sl">' + r.sl + '</td>'
          + '<td class="pd">' + (r.prod || '') + '</td>'
          + '<td class="qt">' + qty + '</td>'
          + '<td class="ra">' + rate + '</td>'
          + '<td class="am">' + amt + '</td></tr>';
  });

  var payBoxes = ['Cash', 'UPI', 'Due'].map(function(p) {
    var checked = (data.payment === p.toLowerCase()) ? 'checked-box' : 'unchecked-box';
    return '<span class="pay-item"><span class="pay-' + checked.replace('-box','') + '"></span> ' + p + '</span>';
  }).join('');

  var dateDisplay = data.date || '';
  if (dateDisplay) {
    var parts = dateDisplay.split('-');
    if (parts.length === 3) dateDisplay = parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  var totalQtyStr = data.totalQty > 0 ? data.totalQty : '';
  var totalAmtStr = data.totalAmt > 0
    ? '₹' + data.totalAmt.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2})
    : '';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>'
    + 'body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#1a1a1a;}'
    + '.page{width:595px;min-height:842px;padding:18px 20px;box-sizing:border-box;}'
    + '.header{display:flex;align-items:center;justify-content:space-between;border-bottom:2.5px solid #1a5c2e;padding-bottom:10px;margin-bottom:10px;}'
    + '.logo{width:85px;height:85px;object-fit:contain;}'
    + '.title-block{text-align:center;flex:1;padding:0 10px;}'
    + '.title-block h1{font-size:22px;font-weight:900;color:#1a5c2e;letter-spacing:3px;margin:0;text-transform:uppercase;}'
    + '.title-leaf{color:#2d7a45;font-size:14px;margin:3px 0;}'
    + '.title-tag{font-size:8px;letter-spacing:2px;color:#1a5c2e;text-transform:uppercase;}'
    + '.meta{text-align:right;min-width:110px;}'
    + '.meta-line{font-size:11px;margin-bottom:5px;}'
    + '.meta-line .lbl{font-weight:700;}'
    + '.meta-line .val{border-bottom:1px solid #555;display:inline-block;min-width:80px;font-size:10.5px;padding:0 2px;}'
    + '.bill-no-val{font-weight:700;color:#1a5c2e;font-size:9.5px;}'
    + '.member-box{background:#e8f5ec;border:1px solid #b0cfb8;border-radius:6px;padding:10px 12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;}'
    + '.member-fields{flex:1;}'
    + '.mrow{display:flex;align-items:center;margin-bottom:7px;gap:6px;font-size:11.5px;}'
    + '.mrow:last-child{margin-bottom:0;}'
    + '.mrow .ml{font-weight:700;white-space:nowrap;}'
    + '.mrow .mv{flex:1;border-bottom:1px solid #555;min-width:80px;padding:0 2px;}'
    + '.mrow .ml2{font-weight:700;white-space:nowrap;margin-left:10px;}'
    + '.mrow .mv2{border-bottom:1px solid #555;min-width:60px;padding:0 2px;}'
    + '.thank{font-style:italic;font-family:Georgia,serif;font-size:11px;color:#1a5c2e;text-align:right;line-height:1.6;margin-left:12px;}'
    + 'table{width:100%;border-collapse:collapse;margin-bottom:10px;}'
    + 'th{background:#2a6b3c;color:#fff;font-size:10.5px;font-weight:700;padding:6px 5px;text-align:center;border-right:1px solid rgba(255,255,255,0.3);}'
    + 'th:last-child{border-right:none;}'
    + 'td{border:1px solid #c0d0b8;padding:5px 4px;font-size:11px;}'
    + '.sl{width:28px;text-align:center;color:#666;}'
    + '.pd{min-width:130px;}'
    + '.qt{width:50px;text-align:center;}'
    + '.ra{width:55px;text-align:right;}'
    + '.am{width:60px;text-align:right;font-weight:600;color:#1a5c2e;}'
    + '.total-row td{background:#e8f5ec;font-weight:700;border:1.5px solid #2a6b3c;font-size:11.5px;padding:6px 5px;}'
    + '.total-row .am{color:#1a5c2e;}'
    + '.pay-section{background:#e8f5ec;border:1px solid #b0cfb8;border-radius:6px;padding:9px 12px;margin-bottom:10px;display:flex;align-items:center;gap:20px;}'
    + '.pay-lbl{font-size:12px;font-weight:700;margin-right:10px;}'
    + '.pay-item{font-size:12px;display:inline-flex;align-items:center;gap:6px;}'
    + '.pay-checked{display:inline-block;width:14px;height:14px;border:2px solid #1a5c2e;border-radius:2px;background:#1a5c2e;position:relative;}'
    + '.pay-unchecked{display:inline-block;width:14px;height:14px;border:2px solid #1a5c2e;border-radius:2px;background:#fff;}'
    + '.partner-box{border-bottom:1px solid #555;margin-bottom:20px;padding:6px 0;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;}'
    + '.partner-val{flex:1;border-bottom:1px solid #555;font-weight:400;padding:0 4px;}'
    + '.footer{display:flex;align-items:center;justify-content:space-between;border-top:1.5px solid #c0d0b8;padding-top:8px;margin-top:10px;}'
    + '.footer-left{display:flex;align-items:center;gap:8px;}'
    + '.footer-tag{font-style:italic;font-family:Georgia,serif;font-size:11px;color:#1a1a1a;line-height:1.4;}'
    + '.footer-right{background:#e8f5ec;border-radius:20px;padding:4px 14px;font-style:italic;font-family:Georgia,serif;font-size:11px;color:#1a5c2e;font-weight:600;}'
    + '.leaf-icon{font-size:20px;color:#2d7a45;}'
    + '</style></head><body><div class="page">'
    /* Header */
    + '<div class="header">'
    + '<img src="' + logoDataUrl + '" class="logo" />'
    + '<div class="title-block"><h1>Sales Invoice</h1><div class="title-leaf">🌿</div><div class="title-tag">Goodness from our communities to your home</div></div>'
    + '<div class="meta">'
    + '<div class="meta-line"><span class="lbl">Bill No. : </span><span class="val bill-no-val">' + data.billNo + '</span></div>'
    + '<div class="meta-line"><span class="lbl">Date : </span><span class="val">' + dateDisplay + '</span></div>'
    + '</div>'
    + '</div>'
    /* Member */
    + '<div class="member-box"><div class="member-fields">'
    + '<div class="mrow"><span class="ml">Our Valued Member :</span><span class="mv">' + data.memberName + '</span></div>'
    + '<div class="mrow"><span class="ml">Village :</span><span class="mv">' + data.village + '</span><span class="ml2">PIN Code :</span><span class="mv2">' + data.pinCode + '</span></div>'
    + '<div class="mrow"><span class="ml">WhatsApp No. :</span><span class="mv">' + data.whatsapp + '</span></div>'
    + '</div>'
    + '<div class="thank">Thank you<br>for being<br>a part of<br>Anuvéa ♥</div>'
    + '</div>'
    /* Table */
    + '<table><thead><tr>'
    + '<th class="sl">Sl. No.</th><th class="pd">Product Details</th><th class="qt">Quantity</th><th class="ra">Rate (₹)</th><th class="am">Amount (₹)</th>'
    + '</tr></thead><tbody>'
    + rows
    + '<tr class="total-row"><td class="sl"></td><td class="pd"></td><td class="qt">' + totalQtyStr + '</td><td class="ra"></td><td class="am">' + totalAmtStr + '</td></tr>'
    + '</tbody></table>'
    /* Payment */
    + '<div class="pay-section"><span class="pay-lbl">Payment Mode :</span>' + payBoxes + '</div>'
    /* Partner */
    + '<div class="partner-box">Community Partner Signature : <span class="partner-val">' + data.partner + '</span></div>'
    /* Footer */
    + '<div class="footer">'
    + '<div class="footer-left"><span class="leaf-icon">🌿</span><div class="footer-tag">Stronger Communities<br>Healthier Families</div></div>'
    + '<div class="footer-right">Pure. Natural. Together.</div>'
    + '</div>'
    + '</div></body></html>';
}

/* ---- Generate & Share ---- */
function generateAndShare() {
  if (!validateForm()) return;

  /* Assign bill number */
  const billNo = generateBillNo();
  document.getElementById('bill_no').textContent = billNo;

  /* Set today's date if blank */
  const dateEl = document.getElementById('inv_date');
  if (!dateEl.value) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    dateEl.value = y + '-' + m + '-' + d;
  }

  const data = collectData();
  data.billNo = billNo;

  /* Show loading */
  const loader = document.getElementById('loading_overlay');
  loader.classList.add('active');

  /* Small delay to let UI update */
  setTimeout(function() {
    const logoDataUrl = document.getElementById('logo_img').src;
    generatePdfAndShare(data, logoDataUrl, loader);
  }, 100);
}

function generatePdfAndShare(data, logoDataUrl, loader) {
  try {
    const htmlContent = buildPdfHtml(data, logoDataUrl);
    const blob = new Blob([htmlContent], { type: 'text/html' });

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'Anuvea-Invoice-' + data.billNo + '.html', { type: 'text/html' });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({
          title: 'Anuvéa Invoice ' + data.billNo,
          text: 'Anuvéa Sales Invoice for ' + data.memberName,
          files: [file]
        }).then(function() {
          loader.classList.remove('active');
          showToast('✅ Invoice shared successfully!');
        }).catch(function(e) {
          loader.classList.remove('active');
          if (e.name !== 'AbortError') {
            fallbackPdfDownload(data, htmlContent, loader);
          }
        });
        return;
      }
    }

    /* Try jsPDF if available */
    if (window.html2pdf) {
      generateWithHtml2Pdf(data, htmlContent, loader);
    } else {
      /* Open print window */
      openPrintWindow(data, htmlContent, loader);
    }
  } catch(e) {
    loader.classList.remove('active');
    showToast('❌ Error: ' + e.message);
  }
}

function openPrintWindow(data, htmlContent, loader) {
  loader.classList.remove('active');
  const win = window.open('', '_blank', 'width=640,height=900');
  if (win) {
    win.document.write(htmlContent);
    win.document.close();
    setTimeout(function() {
      win.print();
    }, 600);
    showToast('📄 Invoice opened — print or save as PDF');
  } else {
    fallbackPdfDownload(data, htmlContent, loader);
  }
}

function fallbackPdfDownload(data, htmlContent, loader) {
  loader.classList.remove('active');
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'Anuvea-Invoice-' + data.billNo + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('⬇️ Invoice downloaded');
}

function downloadPdf() {
  if (!validateForm()) return;

  const data = collectData();
  if (!data.billNo) {
    const billNo = generateBillNo();
    document.getElementById('bill_no').textContent = billNo;
    data.billNo = billNo;
  }

  if (!document.getElementById('inv_date').value) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    document.getElementById('inv_date').value = y + '-' + m + '-' + d;
  }

  const loader = document.getElementById('loading_overlay');
  loader.classList.add('active');

  setTimeout(function() {
    const logoDataUrl = document.getElementById('logo_img').src;
    const freshData = collectData();
    freshData.billNo = data.billNo;
    const htmlContent = buildPdfHtml(freshData, logoDataUrl);
    openPrintWindow(freshData, htmlContent, loader);
  }, 100);
}

/* ---- Clear error on input ---- */
function clearError(el) {
  el.classList.remove('error-field');
}

/* ---- Set today's date on load ---- */
window.addEventListener('DOMContentLoaded', function() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  document.getElementById('inv_date').value = y + '-' + m + '-' + d;

  /* Add oninput handlers for error clearance */
  var inputs = document.querySelectorAll('input[id]');
  inputs.forEach(function(inp) {
    inp.addEventListener('input', function() { clearError(this); });
  });
});
