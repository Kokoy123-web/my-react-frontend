import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import EmployeeList from "./EmployeeList";
import AddEmployee from "./AddEmployee";
import DepartmentList from "./DepartmentList";
import Attendance from "./Attendance";
import PayslipList from "./PayslipList";
import ManageLeaves from "./ManageLeaves";
import { BarChart, LineChart, Timeline } from "./Charts";
import socket from "../socket";
import "./Dashboard.css";

function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployeeCredentials, setNewEmployeeCredentials] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    setShowAddEmployee(false);
    setMobileMenuOpen(false);
  };

  const fetchEmployees = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/employees`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Error fetching employees:", err));
  };

  const fetchDepartments = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/departments`)
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Error fetching departments:", err));
  };

  const fetchPositions = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/positions`)
      .then((res) => setPositions(res.data))
      .catch((err) => console.error("Error fetching positions:", err));
  };

  const fetchAttendance = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/attendance`)
      .then((res) => setAttendance(res.data))
      .catch((err) => console.error("Error fetching attendance:", err));
  };

  const fetchPayslips = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/payslips`)
      .then(res => setPayslips(res.data))
      .catch(err => console.error("Error fetching payslips:", err));
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
    fetchAttendance();
    fetchPayslips();
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleRealtimeUpdate = () => {
      fetchEmployees();
      fetchDepartments();
      fetchAttendance();
      fetchPayslips();
    };

    socket.on("dataChanged", handleRealtimeUpdate);

    return () => {
      socket.off("dataChanged", handleRealtimeUpdate);
    };
  }, []);

  const handleEmployeeUpdate = () => {
    fetchEmployees();
    fetchAttendance();
  };

  const handlePayslipAdd = () => {
    fetchPayslips();
    setActiveTab("payslips");
  };

  const handleDepartmentUpdate = () => {
    fetchDepartments();
  };

  const handleAttendanceUpdate = () => {
    fetchAttendance();
  };

  const handlePayslipUpdate = () => {
    fetchPayslips();
  };

  const handleAddEmployeeSuccess = (data) => {
    setNewEmployeeCredentials(data);
    handleEmployeeUpdate();
    setShowAddEmployee(false);
  };

  const handleCopyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Prepare chart data
  const departmentEmployeeData = useMemo(() => {
    const deptCount = {};
    employees.forEach(emp => {
      deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
    });
    return Object.entries(deptCount).map(([name, count]) => ({
      department: name,
      employees: count
    }));
  }, [employees]);

  const attendanceLineData = useMemo(() => {
    const dateCount = {};
    attendance.forEach(record => {
      const date = record.date || new Date().toISOString().split('T')[0];
      dateCount[date] = (dateCount[date] || 0) + 1;
    });
    return Object.entries(dateCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7) // Last 7 days
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attendance: count
      }));
  }, [attendance]);

  const timelineEvents = useMemo(() => {
    // Recent employee additions (last 5)
    const recentEmployees = [...employees]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5)
      .map(emp => ({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: `New Employee: ${emp.name}`,
        description: `${emp.position} - ${emp.department}`
      }));
    
    // Recent attendance records (last 5)
    const recentAttendance = [...attendance]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(record => {
        const emp = employees.find(e => e.id === record.employee_id);
        return {
          date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          title: `Attendance Recorded`,
          description: `${emp?.name || 'Employee'} - ${record.status || 'Present'}`
        };
      });

    return [...recentEmployees, ...recentAttendance]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [employees, attendance]);

  return (
    <div 
      className="dashboard"
      style={{
        background: 'linear-gradient(135deg, #f0f7f4 0%, #e8f5e8 25%, #d4edda 50%, #c3e6cb 75%, #b8dfc3 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Left side, fixed */}
      <div className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="Employee Management System" className="sidebar-logo-img" />
          </div>
          <div className="sidebar-title">
            <h2>Employee</h2>
            <p>Management System</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => navigateTo("dashboard")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === "employees" ? "active" : ""}`}
            onClick={() => navigateTo("employees")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>All Employees</span>
          </button>
          <button
            className={`nav-item ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => navigateTo("departments")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            <span>Department</span>
          </button>
          <button
            className={`nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => navigateTo("attendance")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Attendance</span>
          </button>
          <button
            className={`nav-item ${activeTab === "payslips" ? "active" : ""}`}
            onClick={() => navigateTo("payslips")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z"></path>
              <path d="M4 9h16"></path>
              <path d="M9 4v16"></path>
            </svg>
            <span>Payslips</span>
          </button>
          <button
            className={`nav-item ${activeTab === "leaves" ? "active" : ""}`}
            onClick={() => navigateTo("leaves")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Leave Requests</span>
          </button>
        </nav>
      </div>

      {/* Main Content Wrapper - Right side */}
      <div className={`dashboard-main-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Top Navigation Bar */}
        <div className="top-navbar">
          <div className="top-navbar-left">
            <button 
              className="top-navbar-hamburger" 
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <button 
              className="sidebar-toggle-btn"
              onClick={() => {
                setSidebarCollapsed(!sidebarCollapsed);
              }}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand" : "Collapse"}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: sidebarCollapsed ? 'scaleX(-1)' : 'scaleX(1)' }}>
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>
          <div className="top-navbar-center">
            <span className="top-navbar-title">Admin Portal</span>
          </div>
          <div className="top-navbar-right">
            <button className="top-navbar-logout" onClick={onLogout} title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="tab-content">
              <div className="dashboard-page-header">
                <div className="dashboard-header-left">
                  <h1>Dashboard</h1>
                  <p>Overview of Employee ID Management</p>
                </div>
                <div className="dashboard-header-right">
                  <button className="notification-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="counters">
                <div className="counter counter-green">
                  <div className="counter-icon" style={{ backgroundColor: "#3b82f6" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="counter-info">
                    <p className="counter-label">Total Employees</p>
                    <p className="counter-value">{employees.length}</p>
                  </div>
                </div>
                <div className="counter counter-yellow">
                  <div className="counter-icon" style={{ backgroundColor: "#10b981" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  </div>
                  <div className="counter-info">
                    <p className="counter-label">Total Departments</p>
                    <p className="counter-value">{departments.length}</p>
                  </div>
                </div>
                <div className="counter counter-red">
                  <div className="counter-icon" style={{ backgroundColor: "#f59e0b" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className="counter-info">
                    <p className="counter-label">Total Attendance</p>
                    <p className="counter-value">{attendance.length}</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                <BarChart
                  data={departmentEmployeeData}
                  title="Employees by Department"
                  xKey="department"
                  yKey="employees"
                  color="#556B2F"
                />
                <LineChart
                  data={attendanceLineData}
                  title="Attendance Trend (Last 7 Days)"
                  xKey="date"
                  yKey="attendance"
                  color="#ef4444"
                />
                <div className="charts-grid-full">
                  <Timeline
                    events={timelineEvents}
                    title="Recent Activity Timeline"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <div className="tab-content">
              <div className="employees-header">
                <h2>All Employees</h2>
                <button 
                  className="add-employee-btn" 
                  onClick={() => setShowAddEmployee(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Employee
                </button>
              </div>
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search employees by name, position, department, email, phone, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <EmployeeList 
                employees={employees} 
                searchTerm={searchTerm}
                onEmployeeUpdate={handleEmployeeUpdate}
                departments={departments}
                positions={positions}
                onPayslipAdd={handlePayslipAdd}
              />
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === "departments" && (
            <div className="tab-content">
              <DepartmentList onUpdate={handleDepartmentUpdate} />
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="tab-content">
              <Attendance 
                employees={employees}
                onAttendanceUpdate={handleAttendanceUpdate}
              />
            </div>
          )}

          {/* Payslips Tab */}
          {activeTab === "payslips" && (
            <div className="tab-content">
              <PayslipList
                payslips={payslips}
                employees={employees}
                onUpdate={handlePayslipUpdate}
              />
            </div>
          )}

          {/* Leave Requests Tab */}
          {activeTab === "leaves" && (
            <div className="tab-content">
              <ManageLeaves />
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="modal-overlay" onClick={() => setShowAddEmployee(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowAddEmployee(false)}
              >
                ×
              </button>
            </div>
            <AddEmployee 
              departments={departments}
              positions={positions}
              onSuccess={handleAddEmployeeSuccess}
              onCancel={() => setShowAddEmployee(false)}
            />
          </div>
        </div>
      )}

      {newEmployeeCredentials && (
        <div className="modal-overlay" onClick={() => setNewEmployeeCredentials(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Created Successfully!</h2>
              <button className="modal-close-btn" onClick={() => setNewEmployeeCredentials(null)}>
                ×
              </button>
            </div>
            <div className="credentials-box">
              <p className="credentials-note">Share these credentials with the employee. They can use them to log in and change their password later.</p>
              <div className="credentials-item">
                <span>Employee ID</span>
                <strong>{newEmployeeCredentials.employee_code || newEmployeeCredentials.id}</strong>
              </div>
              <div className="credentials-item">
                <span>Email</span>
                <div className="credentials-value-row">
                  <strong>{newEmployeeCredentials.email}</strong>
                  <button className="copy-btn" type="button" onClick={() => handleCopyToClipboard(newEmployeeCredentials.email)}>
                    Copy
                  </button>
                </div>
              </div>
              <div className="credentials-item">
                <span>Password</span>
                <div className="credentials-value-row">
                  <strong>{newEmployeeCredentials.password}</strong>
                  <button className="copy-btn" type="button" onClick={() => handleCopyToClipboard(newEmployeeCredentials.password)}>
                    Copy
                  </button>
                </div>
              </div>
              <div className="form-buttons">
                <button className="cancel-btn" type="button" onClick={() => setNewEmployeeCredentials(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;

