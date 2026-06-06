import React, { useState } from "react";
import AddDepartment from "./AddDepartment";
import './Departments.css';
import DepartmentList from "./DepartmentList";

function Departments({ onDepartmentUpdate }) {
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDepartmentAdded = () => {
    setShowAddDepartment(false);
    setRefreshKey(prev => prev + 1);
    if (onDepartmentUpdate) {
      onDepartmentUpdate();
    }
  };

  return (
    <div className="departments-container">
      <div className="departments-header">
        <h2>Department Management</h2>
        <button 
          className="add-department-btn"
          onClick={() => setShowAddDepartment(!showAddDepartment)}
        >
          {showAddDepartment ? 'Cancel' : 'Add Department'}
        </button>
      </div>
      
      {showAddDepartment && (
        <AddDepartment 
          onSuccess={handleDepartmentAdded}
          onCancel={() => setShowAddDepartment(false)}
        />
      )}
      
      <DepartmentList key={refreshKey} onUpdate={refreshKey} />
    </div>
  );
}

export default Departments;
