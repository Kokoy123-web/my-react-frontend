import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertModal from "./AlertModal";


function PayslipModal({ show, onClose, employeeId, employees = [], onSuccess, payslip = null }) {
  const defaultPeriod = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
  const [form, setForm] = useState({
    employee_id: employeeId || "",
    pay_period: defaultPeriod,
    gross_amount: "",
    deductions: "",
    net_amount: ""
  });

  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

  useEffect(() => {
    if (employeeId) {
      setForm(f => ({ ...f, employee_id: employeeId }));
    }
  }, [employeeId]);

  useEffect(() => {
    if (payslip) {
      setForm({
        employee_id: payslip.employee_id,
        pay_period: payslip.pay_period,
        gross_amount: payslip.gross_amount,
        deductions: payslip.deductions,
        net_amount: payslip.net_amount
      });
    }
  }, [payslip]);

  const computedNetAmount = (() => {
    const gross = parseFloat(form.gross_amount);
    const deductions = parseFloat(form.deductions);

    if (Number.isNaN(gross) || Number.isNaN(deductions)) {
      return "";
    }

    return (gross - deductions).toFixed(2);
  })();

  const isValid =
    form.employee_id &&
    form.pay_period.trim() !== "" &&
    form.gross_amount !== "";

  useEffect(() => {
    setForm((prev) => {
      if (prev.net_amount === computedNetAmount) return prev;
      return { ...prev, net_amount: computedNetAmount };
    });
  }, [computedNetAmount]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const showAlert = (msg, type = "info") => {
    setAlert({ show: true, message: msg, type });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValid) {
      showAlert("Please fill in all required fields", "warning");
      return;
    }
    try {
      if (payslip && payslip.id) {
        await axios.put(`http://localhost:5000/payslips/${payslip.id}`, form);
        showAlert("Payslip updated", "success");
      } else {
        await axios.post("http://localhost:5000/payslips", form);
        showAlert("Payslip saved", "success");
      }
      setForm({ employee_id: "", pay_period: "", gross_amount: "", deductions: "", net_amount: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Payslip save error", err.response || err);
      const msg = err.response?.data?.error || err.message || "Error saving payslip";
      showAlert(msg, "error");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{payslip ? "Edit Payslip" : "Add Payslip"}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-employee-form">
          <div className="form-group">
            <label>Employee</label>
            <select name="employee_id" value={form.employee_id} onChange={handleChange} required disabled={!!employeeId || !!payslip}>
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employee_code})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Pay Period</label>
            <input
              type="text"
              name="pay_period"
              value={form.pay_period}
              onChange={handleChange}
              placeholder="e.g. Mar 2026"
              required
            />
          </div>
          <div className="form-group">
            <label>Gross Amount</label>
            <input
              type="number"
              name="gross_amount"
              value={form.gross_amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Deductions</label>
            <input
              type="number"
              name="deductions"
              value={form.deductions}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Net Amount</label>
            <input
              type="number"
              name="net_amount"
              value={form.net_amount || computedNetAmount}
              readOnly
              required
            />
            <small style={{ color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Auto-computed as Gross Amount − Deductions.
            </small>
          </div>
          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={!isValid}>Save</button>
          </div>
        </form>
        <AlertModal
          show={alert.show}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: "", type: "info" })}
        />
      </div>
    </div>
  );
}

export default PayslipModal;
