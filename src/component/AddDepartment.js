import React, { useState } from "react";
import axios from "axios";
import AlertModal from "./AlertModal";
import './AddDepartment.css';

function AddDepartment({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    department_name: "",
    description: ""
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

  const isFormValid =
    form.department_name.trim() !== "" &&
    form.description.trim() !== "";

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validation
    if (!form.department_name.trim() || !form.description.trim()) {
      showAlert("Please fill in all required fields", "warning");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/departments`, form);
      const departmentName = form.department_name;
      showAlert(`Department "${departmentName}" has been added successfully!`, "success");
      setForm({ department_name: "", description: "" });
      if (onSuccess) onSuccess();
    } catch (error) {
      showAlert("Error adding department. Please try again.", "error");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="add-department-form">
        <div className="form-group">
          <label>Department Name</label>
          <input
            type="text"
            name="department_name"
            placeholder="Department Name"
            value={form.department_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-buttons">
          {onCancel && (
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          )}
          <button type="submit" disabled={!isFormValid} className="submit-btn">Add Department</button>
        </div>
      </form>
      <AlertModal
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ show: false, message: "", type: "info" })}
      />
    </>
  );
}

export default AddDepartment;
