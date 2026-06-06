import React, { useState } from "react";
import axios from "axios";
import "./LeaveRequest.css";

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
};

const getLeaveStatusClass = (status = "") => {
  const s = status.toLowerCase();
  if (s === "approved") return "ed-status-approved";
  if (s === "rejected") return "ed-status-rejected";
  if (s === "pending") return "ed-status-pending";
  return "ed-status-default";
};

const getApproverText = (leave) => {
  if (!leave || !leave.status) {
    return <span className="no-approver">—</span>;
  }

  const status = leave.status.toString().toLowerCase();
  if (status === "pending") {
    return <span className="no-approver">—</span>;
  }

  const approver = leave.approved_by_name || "Admin";
  const label = status === "rejected" ? "Rejected by" : "Approved by";

  return <span className="approved-by-name">{`${label} ${approver}`}</span>;
};

function LeaveRequest({ employeeId, leaves, onRequestSubmitted }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const leaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Personal Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Emergency Leave",
    "Other"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.leave_type) return "Please select a leave type";
    if (!formData.start_date) return "Please select a start date";
    if (!formData.end_date) return "Please select an end date";

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) return "Start date cannot be in the past";
    if (endDate < startDate) return "End date cannot be before start date";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/leaves`, {
        employee_id: employeeId,
        ...formData
      });

      setSuccess(true);
      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: ""
      });
      setShowModal(false);

      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch (err) {
      console.error("Error submitting leave request:", err);
      setError(err.response?.data?.error || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ed-page">
      <div className="ed-page-header">
        <div>
          <h1>Leave Requests</h1>
          <p>View your leave requests and submit new ones</p>
        </div>
        <div className="ed-header-actions" >
          <button className="ed-btn-primary" onClick={() => setShowModal(true)}>
           Request Leave
          </button>
        </div>
      </div>
      <div className="ed-content-row">
        <div className="ed-content-full">
          <div className="ed-card">
            <div className="ed-card-header">
              <h3>Your Leave Requests</h3>
            </div>
            <div className="ed-table-container">
              <table className="ed-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actioned By</th>
                    <th>Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: 24, color: "#9ca3af" }}>No leave requests found</td>
                    </tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.leave_type}</td>
                        <td>{formatDate(leave.start_date)}</td>
                        <td>{formatDate(leave.end_date)}</td>
                        <td>{leave.reason || "No reason provided"}</td>
                        <td>
                          <span className={`ed-status-badge ${getLeaveStatusClass(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="approved-by-cell">
                          {getApproverText(leave)}
                        </td>
                        <td>{formatDate(leave.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="ed-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ed-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h3>Submit Leave Request</h3>
              <button className="ed-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="ed-modal-body">
              <form onSubmit={handleSubmit} className="leave-request-form">
                <div className="form-group">
                  <label htmlFor="leave_type">Leave Type *</label>
                  <select
                    id="leave_type"
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start_date">Start Date *</label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_date">End Date *</label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason (Optional)</label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Please provide a reason for your leave request..."
                    rows="4"
                  />
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="success-message">
                    Leave request submitted successfully! It will be reviewed by your administrator.
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Leave Request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveRequest;