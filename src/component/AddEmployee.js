import React, { useState } from "react";
import axios from "axios";
import AlertModal from "./AlertModal";
import './AddEmployee.css';

function AddEmployee({ onSuccess, onCancel, departments = [], positions = [] }) {
  const [form, setForm] = useState({
    name: "",
    position_id: "",
    department_id: "",
    email: "",
    phone: "",
    password: ""
  });

  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

  const isFormValid =
    form.name.trim() !== "" &&
    form.position_id.toString().trim() !== "" &&
    form.department_id.toString().trim() !== "" &&
    form.email.trim() !== "" &&
    form.password.trim().length >= 4;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!isFormValid) {
      showAlert("Please fill in all required fields", "warning");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/employees`, form);
      setForm({
        name: "",
        position_id: "",
        department_id: "",
        email: "",
        phone: "",
        password: ""
      });
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Error adding employee. Please try again.";
      showAlert(message, "error");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="add-employee-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            placeholder="Full Name"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Position</label>
          <select
            name="position_id"
            value={form.position_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Position</option>
            {positions.length === 0 && (
              <option value="" disabled>
                No positions found (check positions table)
              </option>
            )}
            {positions.map((p) => (
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
            value={form.department_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.department_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="Email"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Temporary password"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            placeholder="Phone"
            onChange={handleChange}
          />
        </div>

        <div className="form-buttons">
          {onCancel && (
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          )}
          <button type="submit" disabled={!isFormValid} className="submit-btn">
            Add Employee
          </button>
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

export default AddEmployee;
