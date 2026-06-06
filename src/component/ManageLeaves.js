import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import socket from "../socket";
import "./ManageLeaves.css";

function ManageLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const isAdmin = () => (localStorage.getItem("role") || "").toString().trim().toLowerCase() === "admin";

  const fetchLeaves = useCallback(async () => {
    const currentRole = isAdmin();
    if (!currentRole) {
      setError("Access denied. Only administrators can manage leaves.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/leaves`);
      setLeaves(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError("Failed to load leave requests");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("dataChanged", fetchLeaves);

    return () => {
      socket.off("dataChanged", fetchLeaves);
    };
  }, [fetchLeaves]);

  const handleApprove = (leaveId) => {
    if (!isAdmin()) {
      alert("Access denied. Only administrators can approve leaves.");
      return;
    }
    const userId = localStorage.getItem("userId");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    
    if (!isAuthenticated || !userId) {
      alert("Session expired. Please log in again.");
      window.location.reload();
      return;
    }

    axios.put(`${process.env.REACT_APP_API_URL}/api/leaves/${leaveId}`, {
      status: "Approved",
      approved_by: userId
    })
    .then(() => {
      fetchLeaves();
    })
    .catch((err) => {
      console.error("Error approving leave:", err);
      alert("Failed to approve leave request");
    });
  };

  const handleReject = (leaveId) => {
    if (!isAdmin()) {
      alert("Access denied. Only administrators can reject leaves.");
      return;
    }
    const userId = localStorage.getItem("userId");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    
    if (!isAuthenticated || !userId) {
      alert("Session expired. Please log in again.");
      window.location.reload();
      return;
    }

    axios.put(`${process.env.REACT_APP_API_URL}/api/leaves/${leaveId}`, {
      status: "Rejected",
      approved_by: userId
    })
    .then(() => {
      fetchLeaves();
    })
    .catch((err) => {
      console.error("Error rejecting leave:", err);
      alert("Failed to reject leave request");
    });
  };

  const openUpdateModal = (leave) => {
    setSelectedLeave(leave);
    setNewStatus(leave.status);
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = () => {
    if (!isAdmin()) {
      alert("Access denied. Only administrators can update leave status.");
      return;
    }
    const userId = localStorage.getItem("userId");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    
    if (!isAuthenticated || !userId) {
      alert("Session expired. Please log in again.");
      window.location.reload();
      return;
    }

    if (!newStatus) {
      alert("Please select a status");
      return;
    }

    axios.put(`${process.env.REACT_APP_API_URL}/api/leaves/${selectedLeave.id}`, {
      status: newStatus,
      approved_by: userId
    })
    .then(() => {
      setShowUpdateModal(false);
      setSelectedLeave(null);
      setNewStatus("");
      fetchLeaves();
    })
    .catch((err) => {
      console.error("Error updating leave:", err);
      alert("Failed to update leave request");
    });
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filterStatus === "all") return true;
    return leave.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "approved": return "status-approved";
      case "rejected": return "status-rejected";
      case "pending": return "status-pending";
      default: return "status-default";
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="manage-leaves-loading">Loading leave requests...</div>;
  }

  if (error) {
    return <div className="manage-leaves-error">{error}</div>;
  }

  return (
    <div className="manage-leaves">
      <div className="manage-leaves-header">
        <h2>Leave Requests</h2>
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="leaves-table-container">
        <table className="leaves-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-leaves">
                  No leave requests found
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="employee-info">
                    <div className="employee-name">{leave.employee_name}</div>
                    <div className="employee-code">{leave.employee_code}</div>
                  </td>
                  <td>{leave.leave_type}</td>
                  <td>{formatDate(leave.start_date)}</td>
                  <td>{formatDate(leave.end_date)}</td>
                  <td className="reason-cell">
                    {leave.reason || "No reason provided"}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>{formatDate(leave.created_at)}</td>
                  <td>
                    {leave.status === "Pending" && (
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          onClick={() => handleApprove(leave.id)}
                          title="Approve leave request"
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleReject(leave.id)}
                          title="Reject leave request"
                        >
                          Reject
                        </button>
                
                      </div>
                    )}
                    {leave.status !== "Pending" && (
                      <div className="action-buttons">
                        <button
                          className="update-btn"
                          onClick={() => openUpdateModal(leave)}
                          title="Update leave status"
                          aria-label="Update leave status"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showUpdateModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Leave Status</h3>
              <button className="modal-close" onClick={() => setShowUpdateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <p><strong>Employee:</strong> {selectedLeave.employee_name}</p>
                <p><strong>Leave Type:</strong> {selectedLeave.leave_type}</p>
                <p><strong>Period:</strong> {formatDate(selectedLeave.start_date)} to {formatDate(selectedLeave.end_date)}</p>
                <p><strong>Current Status:</strong> {selectedLeave.status}</p>
              </div>
              <div className="form-group">
                <label htmlFor="status-select">New Status:</label>
                <select
                  id="status-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowUpdateModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleUpdateStatus}>Update Status</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageLeaves;