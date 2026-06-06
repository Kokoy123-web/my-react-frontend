import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertModal from "./AlertModal";
import ConfirmModal from "./ConfirmModal";
import PayslipModal from "./PayslipModal";
import './EmployeeList.css';

function EmployeeList({ employees = [], searchTerm = "", onEmployeeUpdate, departments = [], positions = [], onPayslipAdd, successMessage = "", onClearSuccess }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    position_id: "",
    department_id: "",
    email: "",
    phone: "",
    employee_code: ""
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });
  const [confirm, setConfirm] = useState({ show: false, message: "", onConfirm: null });
  const [showPayslip, setShowPayslip] = useState(false);
  const [payslipEmployee, setPayslipEmployee] = useState(null);
  const [payslipData, setPayslipData] = useState(null);

  
  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const pos = (emp.position || emp.position_name || "").toLowerCase();
    return (
      emp.name?.toLowerCase().includes(search) ||
      emp.employee_code?.toLowerCase().includes(search) ||
      pos.includes(search) ||
      emp.department?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search) ||
      emp.phone?.toLowerCase().includes(search)
    );
  });

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
  };

  useEffect(() => {
    if (successMessage) {
      showAlert(successMessage, "success");
      if (onClearSuccess) {
        onClearSuccess();
      }
    }
  }, [successMessage, onClearSuccess]);

  const handleDelete = async id => {
    setConfirm({
      show: true,
      message: "Are you sure you want to delete this employee?",
      onConfirm: async () => {
        try {
          await axios.delete(`${process.env.REACT_APP_API_URL}/employees/${id}`);
          setConfirm({ show: false, message: "", onConfirm: null });
          showAlert("Employee deleted successfully!", "success");
          if (onEmployeeUpdate) {
            onEmployeeUpdate();
          }
        } catch (error) {
          setConfirm({ show: false, message: "", onConfirm: null });
          showAlert("Error deleting employee", "error");
        }
      }
    });
  };

  const handleEdit = emp => {
    setEditId(emp.id);
    setEditForm({
      name: emp.name,
      position_id: emp.position_id || "",
      department_id: emp.department_id || "",
      email: emp.email,
      phone: emp.phone,
      employee_code: emp.employee_code
    });
  };


  const handleChange = e => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/employees/${editId}`, editForm);
      const employeeName = editForm.name;
      showAlert(`Employee "${employeeName}" has been updated successfully!`, "success");
      setEditId(null);
      if (onEmployeeUpdate) {
        onEmployeeUpdate();
      }
    } catch (error) {
      showAlert("Error updating employee. Please try again.", "error");
    }
  };

  return (
    <>
      <div className="employee-table-container">
        <table>
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  {searchTerm ? 'No employees found matching your search' : 'No employees found'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td style={{ color: '#1b5e20'}}>{emp.employee_code || '-'}</td>
                  <td>{emp.name}</td>
                  <td>{emp.position || emp.position_name || '-'}</td>
                  <td>{emp.department}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>
                    <button
                      className="icon-btn payslip-btn"
                      onClick={() => { setPayslipEmployee(emp); setShowPayslip(true); }}
                      title="Add Payslip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <text x="2" y="20" fontSize="20" fill="#007bff" fontFamily="sans-serif">₱</text>
                      </svg>
                    </button>
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => handleEdit(emp)}
                      title="Edit Employee"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDelete(emp.id)}
                      title="Delete Employee"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editId && (
        <div className="modal-overlay" onClick={() => setEditId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Employee</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setEditId(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="edit-employee-form">
              <div className="form-group">
                <label>Employee Code</label>
                <input type="text" name="employee_code" value={editForm.employee_code || ''} disabled style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={editForm.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Position</label>
                <select
                  name="position_id"
                  value={editForm.position_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Position</option>
                  {positions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.position_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department_id"
                  value={editForm.department_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={editForm.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={editForm.phone} onChange={handleChange} />
              </div>
              <div className="form-buttons">
                <button type="button" onClick={() => setEditId(null)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AlertModal
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ show: false, message: "", type: "info" })}
      />
      <ConfirmModal
        show={confirm.show}
        message={confirm.message}
        onConfirm={confirm.onConfirm || (() => {})}
        onCancel={() => setConfirm({ show: false, message: "", onConfirm: null })}
      />
      <PayslipModal
        show={showPayslip}
        onClose={() => { setShowPayslip(false); setPayslipData(null); }}
        employeeId={payslipEmployee?.id}
        employees={employees}
        payslip={payslipData}
        onSuccess={() => {
          setShowPayslip(false);
          setPayslipData(null);
          if (onEmployeeUpdate) onEmployeeUpdate();
          if (onPayslipAdd) onPayslipAdd();
        }}
      />
    </>
  );
}

export default EmployeeList;
