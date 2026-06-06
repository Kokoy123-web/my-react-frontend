import React, { useState } from "react";
import axios from "axios";
import PayslipModal from "./PayslipModal";
import AlertModal from "./AlertModal";
import './PayslipList.css';

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") return "--";
  return `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function PayslipList({ payslips = [], employees = [], onUpdate }) {
  const [editingPayslip, setEditingPayslip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

  const showAlert = (msg, type = "info") => {
    setAlert({ show: true, message: msg, type });
  };

  const handleEdit = p => {
    setEditingPayslip(p);
    setShowModal(true);
  };

  const handleDelete = async p => {
    if (!window.confirm("Delete this payslip?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/payslips/${p.id}`);
      showAlert("Payslip deleted", "success");
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      showAlert("Error deleting payslip", "error");
    }
  };

  const handleSuccess = () => {
    if (onUpdate) onUpdate();
    setShowModal(false);
  };

  return (
    <>
      <div className="payslip-header">
        <h1>Payslip records</h1>
      </div>
      <div className="payslip-table-container">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Pay Period</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Net</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map(p => (
                <tr key={p.id}>
                  <td>{p.name || '-'}<br/><small style = {{color: 'green', fontWeight: 'bold'}}>{p.employee_code || ''}</small></td>
                  <td>{p.pay_period}</td>
                  <td>{formatCurrency(p.gross_amount)}</td>
                  <td>{formatCurrency(p.deductions)}</td>
                  <td>{formatCurrency(p.net_amount)}</td>
                  <td>
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => handleEdit(p)}
                      title="Edit Payslip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDelete(p)}
                      title="Delete Payslip"
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
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <PayslipModal
          show={showModal}
          onClose={() => { setShowModal(false); setEditingPayslip(null); }}
          employeeId={editingPayslip ? editingPayslip.employee_id : null}
          employees={employees}
          onSuccess={handleSuccess}
          payslip={editingPayslip}
        />
      )}

      <AlertModal
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ show: false, message: "", type: "info" })}
      />
    </>
  );
}

export default PayslipList;
