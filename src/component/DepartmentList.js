import React, { useEffect, useState } from "react";
import axios from "axios";
import AlertModal from "./AlertModal";
import ConfirmModal from "./ConfirmModal";
import AddDepartment from "./AddDepartment";
import './DepartmentList.css';

function DepartmentList({ onUpdate }) {
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ department_name: "", description: "" });
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });
  const [confirm, setConfirm] = useState({ show: false, message: "", onConfirm: null });

  const fetchDepartments = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/departments`)
      .then(res => setDepartments(res.data))
      .catch(err => console.error("Error fetching departments:", err));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [onUpdate]);

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
  };

  const handleDelete = async id => {
    setConfirm({
      show: true,
      message: "Are you sure you want to delete this department?",
      onConfirm: async () => {
        try {
          await axios.delete(`${process.env.REACT_APP_API_URL}/departments/${id}`);
          setConfirm({ show: false, message: "", onConfirm: null });
          showAlert("Department deleted successfully!", "success");
          fetchDepartments();
        } catch (error) {
          setConfirm({ show: false, message: "", onConfirm: null });
          showAlert("Error deleting department", "error");
        }
      }
    });
  };

  const handleEdit = dep => {
    setEditId(dep.id);
    setEditForm({ department_name: dep.department_name, description: dep.description });
  };

  const handleChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    if (!editForm.department_name.trim() || !editForm.description.trim()) {
      showAlert("Please fill in all required fields", "warning");
      return;
    }
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/departments/${editId}`, editForm);
      const departmentName = editForm.department_name;
      showAlert(`Department "${departmentName}" has been updated successfully!`, "success");
      setEditId(null);
      fetchDepartments();
    } catch (error) {
      showAlert("Error updating department. Please try again.", "error");
    }
  };

  return (
    <>
      <div className="departments-header">
        <h2>All Departments</h2>
        <button 
          className="add-department-btn" 
          onClick={() => setShowAddDepartment(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Department
        </button>
      </div>
      <div className="department-table-container">
        <table>
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No departments found
                </td>
              </tr>
            ) : (
              departments.map(dep => (
                <tr key={dep.id}>
                  <td>{dep.department_name}</td>
                  <td>{dep.description || '-'}</td>
                  <td>
                    <button 
                      className="icon-btn edit-btn" 
                      onClick={() => handleEdit(dep)}
                      title="Edit Department"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button 
                      className="icon-btn delete-btn" 
                      onClick={() => handleDelete(dep.id)}
                      title="Delete Department"
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
              <h2>Edit Department</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setEditId(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="edit-department-form">
              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  name="department_name"
                  value={editForm.department_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={editForm.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="button" onClick={() => setEditId(null)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
        <div className="modal-overlay" onClick={() => setShowAddDepartment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Department</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowAddDepartment(false)}
              >
                ×
              </button>
            </div>
            <AddDepartment 
              onSuccess={() => {
                fetchDepartments();
                setShowAddDepartment(false);
                if (onUpdate) onUpdate();
              }}
              onCancel={() => setShowAddDepartment(false)}
            />
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
    </>
  );
}

export default DepartmentList;
