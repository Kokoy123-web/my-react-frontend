import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./EmployeeDashboard.css";
import avatarImg from "./avatar.jpg";
import socket from "../socket";
import EmployeeProfile from "./EmployeeProfile";
import EmployeeRecords from "./EmployeeRecords";
import LeaveRequest from "./LeaveRequest";
import { PieChart } from "./Charts";

const formatTime = (t) => {
  if (!t) return "--";
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(t)) {
    const parts = t.split(":");
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    if (h > 12) h -= 12;
    return h + ":" + m + " " + ampm;
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

function TimeInOutCard({ attendance, today }) {
  const recentRec =
    attendance.find((r) => r.time_in || r.time_out) ||
    attendance.find((r) => r.date === today) ||
    {};
  const hasRecord = !!(recentRec.time_in || recentRec.time_out);
  return (
    <div className="ed-card-timeinout">
      <div className="ed-card-timeinout-header">
        <div className="ed-card-timeinout-label">
          <div className="ed-card-icon-wrap">
            <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="8" stroke="#64748b" strokeWidth="1.8" />
              <path d="M9 5v4l2.5 1.5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="ed-card-title">TIME IN / OUT</span>
        </div>
        {!hasRecord && <span className="ed-badge-notlogged">Not logged</span>}
      </div>
      <div className="ed-timeinout-times">
        <div className="ed-time-block">
          <div className="ed-time-sublabel">↑ In</div>
          <div className="ed-time-value">{formatTime(recentRec.time_in)}</div>
        </div>
        <div className="ed-time-block">
          <div className="ed-time-sublabel">↓ Out</div>
          <div className="ed-time-value">{formatTime(recentRec.time_out)}</div>
        </div>
      </div>
    </div>
  );
}

function DaysPresentCard({ attendance }) {
  const total = attendance.length;
  const present = attendance.filter((r) => (r.status || "").toLowerCase().includes("present")).length;
  const pct = total ? Math.round((present / total) * 100) : 0;
  return (
    <div className="ed-card-days">
      <div className="ed-card-days-header">
        <div className="ed-card-icon-wrap green">
          <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="12" height="10" rx="2" stroke="#1bb31b" strokeWidth="1.8" />
            <path d="M6 3v3M12 3v3" stroke="#1bb31b" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="ed-card-days-title">DAYS PRESENT</span>
      </div>
      <div className="ed-card-days-count">
        <span className="ed-count-big">{present}</span>
        <span className="ed-count-total">/ {total}</span>
        <span className="ed-badge-pct">+2.5%</span>
      </div>
      <div className="ed-progress-track">
        <div className="ed-progress-fill" style={{ width: pct + "%" }} />
      </div>
      <div className="ed-card-sublabel">this month</div>
    </div>
  );
}

function AttendanceRateCard({ attendance }) {
  const total = attendance.length;
  const present = attendance.filter((r) => (r.status || "").toLowerCase().includes("present")).length;
  const rate = total ? Math.round((present / total) * 100) : 0;
  return (
    <div className="ed-card-rate">
      <div className="ed-card-days-header">
        <div className="ed-card-icon-wrap purple">
          <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12l3-3 2 2 4-4 3 3" stroke="#6f57d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 7h3v3" stroke="#6f57d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="ed-card-days-title">ATTENDANCE RATE</span>
      </div>
      <div className="ed-rate-main-value">{rate}%</div>
      <div className="ed-rate-change">+2.5% this month</div>
      <div className="ed-progress-track">
        <div className="ed-progress-fill" style={{ width: rate + "%" }} />
      </div>
    </div>
  );
}

function LatestPayslipCard({ payslip }) {
  const net = payslip?.net_amount
    ? "₱" + Number(payslip.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "--";
  const dateStr = payslip?.date
    ? new Date(payslip.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : payslip?.pay_period || "";
  return (
    <div className="ed-card-payslip">
      <div className="ed-card-payslip-header">
        <span className="ed-card-payslip-title">LATEST PAYSLIP</span>
        <span className="ed-badge-verified">
          <svg width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 6.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Verified
        </span>
      </div>
      <div className="ed-card-payslip-amount">{net}</div>
      <div className="ed-card-payslip-sub">{dateStr} · Net Pay</div>
    </div>
  );
}

function AttendanceTable({ attendance, attendanceStatusData }) {
  const recent = attendance.slice(0, 5);
  return (
    <div className="ed-card">
      <div className="ed-card-header">
        <div className="ed-card-header-left">
          <div className="ed-card-icon-wrap green">
            <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 5h12M2 9h9M2 13h6" stroke="#1bb31b" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="ed-card-header-title" style={{ marginLeft: 8 }}>Recent Attendance</span>
        </div>
        <button className="ed-view-all-btn">View all</button>
      </div>
      <div className="ed-table-wrap">
        <table className="ed-table">
          <thead>
            <tr>
              {["DATE", "TIME IN", "TIME OUT", "STATUS"].map((h) => (<th key={h}>{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 24, color: "#9ca3af" }}>No records found</td>
              </tr>
            ) : (
              recent.map((rec) => (
                <tr key={rec.id}>
                  <td className="bold">{formatDate(rec.date)}</td>
                  <td>{formatTime(rec.time_in)}</td>
                  <td>{formatTime(rec.time_out)}</td>
                  <td>
                    {rec.status && (<span className={`ed-status-badge ${getStatusClass(rec.status)}`}>{rec.status.toUpperCase()}</span>)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {attendanceStatusData && attendanceStatusData.length > 0 && (
        <div className="ed-attendance-chart">
          <PieChart
            data={attendanceStatusData}
            title="Attendance Status Distribution"
            valueKey="count"
            labelKey="status"
            colors={["#10b981", "#f59e0b", "#ef4444"]}
          />
        </div>
      )}
    </div>
  );
}

function MonthlySummary({ attendance }) {
  const now = new Date();
  const monthLabel = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const total = attendance.length;
  const present = attendance.filter((r) => (r.status || "").toLowerCase().includes("present")).length;
  const absent = total - present;
  const late = attendance.filter((r) => (r.status || "").toLowerCase().includes("late")).length;
  const rate = total ? Math.round((present / total) * 100) : 0;
  const rows = [
    { label: "Days Present", value: present + " / " + total + " days", cls: "green" },
    { label: "Days Absent", value: absent + " pending days", cls: "red" },
    { label: "Late Arrivals", value: late + " this month", cls: "yellow" },
  ];
  return (
    <div className="ed-card ed-card-body">
      <div className="ed-card-header-left" style={{ marginBottom: 14 }}>
        <div className="ed-card-icon-wrap green">
          <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6h12M5 2v2M11 2v2" stroke="#1bb31b" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="2" y="4" width="12" height="10" rx="2" stroke="#1bb31b" strokeWidth="1.6" />
          </svg>
        </div>
        <span className="ed-card-header-title" style={{ marginLeft: 8 }}>Monthly Summary</span>
        <span className="ed-card-header-meta" style={{ marginLeft: "auto" }}>{monthLabel}</span>
      </div>
      {rows.map(({ label, value, cls }) => (
        <div key={label} className="ed-summary-row-item">
          <div className="ed-summary-row-label">{label}</div>
          <div className={`ed-summary-row-value ${cls}`}>{value}</div>
        </div>
      ))}
      <div className="ed-rate-row">
        <span className="ed-rate-label">Attendance rate</span>
        <span className="ed-rate-value">{rate}%</span>
      </div>
      <div className="ed-progress-track">
        <div className="ed-progress-fill" style={{ width: rate + "%" }} />
      </div>
    </div>
  );
}

function QuickActions({ onNavigate }) {
  return (
    <div className="ed-card ed-card-body">
      <div className="ed-card-header-left" style={{ marginBottom: 14 }}>
        <div className="ed-card-icon-wrap" style={{ background: "#fff8e1" }}>
          <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2v12M2 8h12" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span className="ed-card-header-title" style={{ marginLeft: 8 }}>Quick Actions</span>
      </div>
      <div className="ed-quick-actions">
        <button className="ed-quick-btn-primary">Log Time In</button>
        <button className="ed-quick-btn-secondary" onClick={() => onNavigate("records")}>Download Payslip</button>
        <button className="ed-quick-btn-secondary" onClick={() => onNavigate("records")}>View Full Records</button>
      </div>
    </div>
  );
}

function EmployeeDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => {
      if (!mq.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };
  const today = new Date().toISOString().split("T")[0];
  const nowLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const fetchEmployeeRealtimeData = useCallback(() => {
    if (!employeeId) return;
    axios.get(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`).then((r) => setEmployee(r.data));
    axios.get(`${process.env.REACT_APP_API_URL}/attendance/employee/${employeeId}`).then((r) => setAttendance(r.data));
    axios.get(`${process.env.REACT_APP_API_URL}/payslips/employee/${employeeId}`).then((r) => setPayslips(r.data));
    axios.get(`${process.env.REACT_APP_API_URL}/api/leaves/employee/${employeeId}`).then((r) => setLeaves(r.data));
  }, [employeeId]);
  useEffect(() => {
    fetchEmployeeRealtimeData();
  }, [fetchEmployeeRealtimeData]);
  useEffect(() => {
    if (!employeeId) return;
    if (!socket.connected) socket.connect();
    const handleRealtimeUpdate = (payload = {}) => {
      const changedEmployeeId = Number(payload.employeeId);
      const currentEmployeeId = Number(employeeId);
      const shouldRefresh = !payload.employeeId || changedEmployeeId === currentEmployeeId || payload.resource !== "employees";
      if (shouldRefresh) fetchEmployeeRealtimeData();
    };
    socket.on("dataChanged", handleRealtimeUpdate);
    return () => socket.off("dataChanged", handleRealtimeUpdate);
  }, [employeeId, fetchEmployeeRealtimeData]);

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: (<svg width="19" height="19" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="11" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="2" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" /></svg>),
    },
    {
      key: "profile",
      label: "Profile",
      icon: (<svg width="19" height="19" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9.5" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.8" /><path d="M2 17c0-4 3.134-7 7.5-7S17 13 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>),
    },
    {
      key: "leave",
      label: "Leave Request",
      icon: (<svg width="19" height="19" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" /><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" /><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" /><line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" /></svg>),
    },
    {
      key: "records",
      label: "Records",
      icon: (<svg width="19" height="19" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 8h13M8 3v13" stroke="currentColor" strokeWidth="1.8" /></svg>),
    },
  ];

  const sidebar = (
    <div className={`ed-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <div className="ed-sidebar-logo">
        <div className="ed-sidebar-logo-icon">
          <img src="/logo.png" alt="Employee Management System" className="ed-sidebar-logo-img" />
        </div>
        <div className="ed-sidebar-logo-text">
          <h2>Employee</h2>
          <p>Management System</p>
        </div>
      </div>
      <nav className="ed-sidebar-nav">
        {navItems.map((item) => (
          <button key={item.key} className={`ed-nav-item ${activeTab === item.key ? "active" : ""}`} onClick={() => navigateTo(item.key)}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="ed-sidebar-profile">
        <img src={employee?.photo || avatarImg} alt={employee?.name || "Avatar"} />
        <div>
          <span className="ed-sidebar-profile-name">{employee?.name || "Employee"}</span>
          <span className="ed-sidebar-profile-pos">{employee?.position || "Employee"}</span>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    // Prepare pie chart data for attendance status
    const attendanceStatusData = [
      { status: "Present", count: attendance.filter(r => (r.status || "").toLowerCase().includes("present")).length },
      { status: "Late", count: attendance.filter(r => (r.status || "").toLowerCase().includes("late")).length },
      { status: "Absent", count: attendance.filter(r => !((r.status || "").toLowerCase().includes("present")) && !((r.status || "").toLowerCase().includes("late"))).length }
    ].filter(item => item.count > 0);

    return (
    <div className="ed-page">
      <div className="ed-page-header">
        <div>
          <h1>Hi {employee?.name} 👋</h1>
          <p>Welcome to your dashboard — {nowLabel}</p>
        </div>
        <div className="ed-header-actions">
          <div className="ed-notif-btn">
            <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2a6 6 0 0 1 6 6v3l1.5 3H1.5L3 11V8a6 6 0 0 1 6-6zM7.5 16a1.5 1.5 0 0 0 3 0" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="ed-avatar-badge">{(employee?.name || "E").split(" ").map((w) => w[0]).join(" ").slice(0, 2).toUpperCase()}</div>
        </div>
      </div>
      <div className="ed-summary-row">
        <TimeInOutCard attendance={attendance} today={today} />
        <DaysPresentCard attendance={attendance} />
        <AttendanceRateCard attendance={attendance} />
        <LatestPayslipCard payslip={payslips[0]} />
      </div>
      <div className="ed-content-row">
        <div className="ed-content-left">
          <AttendanceTable attendance={attendance} attendanceStatusData={attendanceStatusData} />
        </div>
        <div className="ed-content-right">
          <MonthlySummary attendance={attendance} />
          <QuickActions onNavigate={setActiveTab} />
        </div>
      </div>
    </div>
  );
};

  if (!employee) return <div className="ed-loading">Loading...</div>;

  return (
    <div className="ed-root">
      {mobileMenuOpen && (
        <button
          type="button"
          className="ed-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {sidebar}
      <div className="ed-main-container">
        <div className="ed-top-navbar">
          <div className="ed-top-navbar-left">
            <button
              className="ed-top-navbar-hamburger"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          <div className="ed-top-navbar-center">
            <span className="ed-top-navbar-title">Employee Portal</span>
          </div>
          <div className="ed-top-navbar-right">
            <button className="ed-top-navbar-logout" onClick={onLogout} title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
        <div className="ed-main">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "profile" && <EmployeeProfile employee={employee} onEmployeeUpdated={setEmployee} />}
          {activeTab === "leave" && <LeaveRequest employeeId={employeeId} leaves={leaves} onRequestSubmitted={fetchEmployeeRealtimeData} />}
          {activeTab === "records" && <EmployeeRecords attendance={attendance} payslips={payslips} employee={employee} />}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;