import React, { useState } from "react";
import { downloadPayslipPDF, printPayslipPDF } from "./payslipUtils";
import "./EmployeeRecords.css";

const formatTime = (t) => {
  if (!t) return "--";
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(t)) {
    const parts = t.split(":");
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    if (h > 12) h -= 12;
    return `${h}:${m} ${ampm}`;
  }
  const dt = new Date(t);
  return isNaN(dt.getTime())
    ? t
    : dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
};

const getStatusClass = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("present")) return "ed-status-present";
  if (s.includes("late")) return "ed-status-late";
  if (s.includes("absent")) return "ed-status-absent";
  return "ed-status-default";
};

function EmployeeRecords({ attendance = [], payslips = [], employee }) {
  const [recordsTab, setRecordsTab] = useState("attendance");
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPayslip = async (payslip) => {
    setDownloadingId(payslip.id);
    try {
      await downloadPayslipPDF(payslip, employee);
    } finally {
      setDownloadingId(null);
    }
  };

  const total = attendance.length;
  const present = attendance.filter((r) => (r.status || "").toLowerCase().includes("present")).length;
  const halfDay = attendance.filter((r) => (r.status || "").toLowerCase().includes("half")).length;
  const rate = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="ed-page">
      <div className="ed-page-header">
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a202c" }}>My Records</h2>
          <p>Attendance history and payslip details</p>
        </div>
        <button className="ed-filter-btn">
          <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4h12M5 8h6M8 12h0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Filter
        </button>
      </div>

      <div className="ed-records-stat-row">
        <div className="ed-records-stat-card ed-stat-green">
          <div className="ed-stat-top">
            <div className="ed-stat-icon-wrap green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="ed-stat-value green">{present}</div>
          </div>
          <div className="ed-stat-label">Days Present</div>
          <div className="ed-stat-sub">Out of {total} total days</div>
        </div>

        <div className="ed-records-stat-card ed-stat-yellow">
          <div className="ed-stat-top">
            <div className="ed-stat-icon-wrap yellow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="ed-stat-value yellow">{halfDay}</div>
          </div>
          <div className="ed-stat-label">Half Days</div>
          <div className="ed-stat-sub">Partial attendance days</div>
        </div>

        <div className="ed-records-stat-card ed-stat-blue">
          <div className="ed-stat-top">
            <div className="ed-stat-icon-wrap blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="ed-stat-value blue">{rate}%</div>
          </div>
          <div className="ed-stat-label">Attendance Rate</div>
          <div className="ed-stat-progress-wrap">
            <div className="ed-stat-progress-track">
              <div className="ed-stat-progress-fill blue" style={{ width: `${rate}%` }} />
            </div>
            <span className="ed-stat-progress-pct">{rate}%</span>
          </div>
        </div>
      </div>

      <div className="ed-card ed-card-body">
        <div className="ed-tabs">
          {['attendance', 'payslips'].map((t) => (
            <button key={t} className={`ed-tab-btn ${recordsTab === t ? 'active' : ''}`} onClick={() => setRecordsTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="ed-table-wrap">
          {recordsTab === 'attendance' ? (
            <table className="ed-table">
              <thead>
                <tr>
                  {['DATE', 'TIME IN', 'TIME OUT', 'STATUS'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec) => (
                  <tr key={rec.id}>
                    <td className="bold">{formatDate(rec.date)}</td>
                    <td>{formatTime(rec.time_in)}</td>
                    <td>{formatTime(rec.time_out)}</td>
                    <td>
                      {rec.status && (
                        <span className={`ed-status-badge ${getStatusClass(rec.status)}`}>
                          {rec.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="ed-table">
              <thead>
                <tr>
                  {['PERIOD', 'GROSS', 'DEDUCTIONS', 'NET', 'STATUS', 'ACTIONS'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payslips.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>
                      No payslips available.
                    </td>
                  </tr>
                ) : (
                  payslips.map((p) => {
                    const fmt = (v) => (v ? `₱${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "--");
                    return (
                      <tr key={p.id}>
                        <td className="bold">{p.pay_period || "--"}</td>
                        <td>{fmt(p.gross_amount)}</td>
                        <td>{fmt(p.deductions)}</td>
                        <td className="net">{fmt(p.net_amount)}</td>
                        <td>
                          <span className="ed-status-badge ed-status-paid">{p.status || 'Paid'}</span>
                        </td>
                        <td>
                          <div className="ed-payslip-actions">
                            <button
                              type="button"
                              className="ed-download-btn"
                              onClick={() => handleDownloadPayslip(p)}
                              disabled={downloadingId === p.id}
                              title="Download payslip as PDF"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M12 3v12m0 0l4-4m-4 4L8 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              {downloadingId === p.id ? "…" : "PDF"}
                            </button>
                            <button
                              type="button"
                              className="ed-print-btn"
                              onClick={() => printPayslipPDF(p, employee)}
                              title="Print payslip"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M6 9V4h12v5M6 18H4a2 2 0 0 1-2-2v-5h20v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <rect x="6" y="14" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              Print
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeRecords;
