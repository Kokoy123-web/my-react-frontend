const COMPANY = {
  name: "Employee Management System",
  department: "Human Resources & Payroll",
  address: "Bunawan, Agusan Del Sur, Philippines",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatPayslipCurrency(amount) {
  const num = Number(amount);
  const formatted = Number.isFinite(num)
    ? num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";
  return `₱ ${formatted}`;
}

function formatIssueDate(payslip) {
  if (payslip?.date) {
    const d = new Date(payslip.date);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    }
  }
  return new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

function payslipReference(payslip) {
  const period = (payslip?.pay_period || "N-A").replace(/\s+/g, "-").toUpperCase();
  const id = payslip?.id ? String(payslip.id).padStart(4, "0") : "0000";
  return `PS-${id}-${period}`;
}

export function getPayslipDocumentStyles() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background: #e8ecef;
      color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .ps-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
    }
    .ps-sheet {
      padding: 14mm 16mm 12mm;
      position: relative;
    }
    .ps-watermark {
      position: absolute;
      top: 42%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-28deg);
      font-size: 52px;
      font-weight: 800;
      letter-spacing: 0.2em;
      color: rgba(27, 94, 32, 0.04);
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
    }
    .ps-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 14px;
      border-bottom: 3px solid #1b5e20;
      margin-bottom: 16px;
    }
    .ps-company-name {
      font-size: 18px;
      font-weight: 800;
      color: #1b5e20;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .ps-company-meta {
      margin-top: 6px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    .ps-doc-meta {
      text-align: right;
      min-width: 180px;
    }
    .ps-doc-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
    }
    .ps-doc-title {
      margin-top: 4px;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.04em;
    }
    .ps-doc-ref {
      margin-top: 8px;
      font-size: 11px;
      color: #334155;
      font-weight: 600;
    }
    .ps-period-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 18px;
    }
    .ps-period-banner strong {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .ps-period-banner span {
      font-size: 15px;
      font-weight: 700;
    }
    .ps-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
    }
    .ps-employee-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .ps-employee-cell {
      padding: 10px 14px;
      border-bottom: 1px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;
    }
    .ps-employee-cell:nth-child(2n) { border-right: none; }
    .ps-employee-cell:nth-last-child(-n+2) { border-bottom: none; }
    .ps-field-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .ps-field-value {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }
    .ps-section-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #1b5e20;
      margin-bottom: 8px;
      padding-left: 2px;
    }
    .ps-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 12px;
    }
    .ps-table thead th {
      background: #f1f5f9;
      color: #475569;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: left;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
    }
    .ps-table thead th:last-child { text-align: right; }
    .ps-table tbody td {
      padding: 11px 14px;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }
    .ps-table tbody td:last-child {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      color: #0f172a;
    }
    .ps-table tbody tr:nth-child(even) td { background: #fafbfc; }
    .ps-deduction td:last-child { color: #b91c1c; }
    .ps-net-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1b5e20;
      color: #fff;
      padding: 16px 18px;
      border-radius: 8px;
      margin-bottom: 22px;
    }
    .ps-net-label {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ps-net-sub {
      font-size: 10px;
      opacity: 0.85;
      margin-top: 4px;
      font-weight: 500;
    }
    .ps-net-amount {
      font-size: 26px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .ps-summary-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    .ps-summary-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .ps-summary-card span {
      display: block;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
    }
    .ps-summary-card strong {
      font-size: 15px;
      font-variant-numeric: tabular-nums;
      color: #0f172a;
    }
    .ps-summary-card.ps-summary-net {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .ps-summary-card.ps-summary-net strong { color: #166534; }
    .ps-footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 14px;
      text-align: center;
    }
    .ps-footer p {
      font-size: 9px;
      color: #64748b;
      line-height: 1.6;
      max-width: 520px;
      margin: 0 auto 6px;
    }
    .ps-footer .ps-sign-line {
      margin-top: 28px;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      text-align: center;
    }
    .ps-sign-block {
      flex: 1;
      max-width: 200px;
    }
    .ps-sign-block .line {
      border-top: 1px solid #94a3b8;
      margin-bottom: 6px;
      padding-top: 4px;
      font-size: 9px;
      color: #475569;
      font-weight: 600;
    }
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    @media print {
      html, body {
        width: 100%;
        height: auto;
        margin: 0;
        padding: 0;
        background: #fff !important;
      }
      .ps-page {
        box-shadow: none;
        width: 100%;
        max-width: 100%;
        min-height: auto;
        margin: 0;
      }
      .ps-sheet { padding: 0; }
      .ps-watermark { opacity: 0.06; }
    }
  `;
}

export function getPayslipBodyHtml(payslip, employee) {
  const gross = formatPayslipCurrency(payslip?.gross_amount);
  const deductions = formatPayslipCurrency(payslip?.deductions);
  const net = formatPayslipCurrency(payslip?.net_amount);
  const status = escapeHtml((payslip?.status || "Paid").toUpperCase());
  const ref = escapeHtml(payslipReference(payslip));
  const period = escapeHtml(payslip?.pay_period || "N/A");
  const issueDate = escapeHtml(formatIssueDate(payslip));

  return `
    <div class="ps-page" id="payslip-document">
      <div class="ps-sheet">
        <div class="ps-watermark">PAYSLIP</div>

        <header class="ps-header">
          <div>
            <div class="ps-company-name">${escapeHtml(COMPANY.name)}</div>
            <div class="ps-company-meta">
              ${escapeHtml(COMPANY.department)}<br />
              ${escapeHtml(COMPANY.address)}
            </div>
          </div>
          <div class="ps-doc-meta">
            <div class="ps-doc-label">Official Earnings Statement</div>
            <div class="ps-doc-title">PAYSLIP</div>
            <div class="ps-doc-ref">Ref: ${ref}</div>
          </div>
        </header>

        <div class="ps-period-banner">
          <div>
            <strong>Pay Period</strong><br />
            <span>${period}</span>
          </div>
          <div style="text-align:right">
            <div class="ps-doc-label" style="color:rgba(255,255,255,0.8);margin-bottom:6px">Date Issued</div>
            <span style="font-size:13px;font-weight:600">${issueDate}</span>
          </div>
          <span class="ps-status">${status}</span>
        </div>

        <div class="ps-employee-grid">
          <div class="ps-employee-cell">
            <div class="ps-field-label">Employee Name</div>
            <div class="ps-field-value">${escapeHtml(employee?.name || "N/A")}</div>
          </div>
          <div class="ps-employee-cell">
            <div class="ps-field-label">Employee ID</div>
            <div class="ps-field-value">${escapeHtml(employee?.employee_code || "N/A")}</div>
          </div>
          <div class="ps-employee-cell">
            <div class="ps-field-label">Position</div>
            <div class="ps-field-value">${escapeHtml(employee?.position || "N/A")}</div>
          </div>
          <div class="ps-employee-cell">
            <div class="ps-field-label">Department</div>
            <div class="ps-field-value">${escapeHtml(employee?.department || "N/A")}</div>
          </div>
        </div>

        <div class="ps-summary-row">
          <div class="ps-summary-card">
            <span>Gross Pay</span>
            <strong>${gross}</strong>
          </div>
          <div class="ps-summary-card">
            <span>Total Deductions</span>
            <strong style="color:#b91c1c">${deductions}</strong>
          </div>
          <div class="ps-summary-card ps-summary-net">
            <span>Net Pay</span>
            <strong>${net}</strong>
          </div>
        </div>

        <div class="ps-section-title">Earnings</div>
        <table class="ps-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (PHP)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary / Gross Pay</td>
              <td>${gross}</td>
            </tr>
          </tbody>
        </table>

        <div class="ps-section-title">Deductions</div>
        <table class="ps-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (PHP)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="ps-deduction">
              <td>Total Deductions</td>
              <td>${deductions}</td>
            </tr>
          </tbody>
        </table>

        <div class="ps-net-box">
          <div>
            <div class="ps-net-label">Net Pay (Take Home)</div>
            <div class="ps-net-sub">Amount payable for this pay period</div>
          </div>
          <div class="ps-net-amount">${net}</div>
        </div>

        <footer class="ps-footer">
          <p>
            This is a computer-generated payslip issued by ${escapeHtml(COMPANY.name)}.
            It is intended for the employee named above and contains confidential payroll information.
          </p>
          <p>Please retain this document for your records. For discrepancies, contact the HR/Payroll office within five (5) working days.</p>
          <div class="ps-sign-line">
            <div class="ps-sign-block">
              <div class="line">Prepared by — HR / Payroll</div>
            </div>
            <div class="ps-sign-block">
              <div class="line">Received by — Employee</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `;
}

export function getPayslipDocumentHtml(payslip, employee) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payslip — ${escapeHtml(employee?.name || "Employee")} — ${escapeHtml(payslip?.pay_period || "")}</title>
  <style>${getPayslipDocumentStyles()}</style>
</head>
<body>
  ${getPayslipBodyHtml(payslip, employee)}
</body>
</html>`;
}
