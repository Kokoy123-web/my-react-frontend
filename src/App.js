import React, { useState, useRef, useEffect } from "react";
import Dashboard from "./component/Dashboard";
import EmployeeDashboard from "./component/EmployeeDashboard";
import Login from "./component/Login";
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
const loginRef = useRef(null);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated") === "true";
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    
    if (auth && role && userId) {
      setIsAuthenticated(true);
    } else {
      // Clear invalid session
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("employeeId");
      setIsAuthenticated(false);
    }
    
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        // decide dashboard type based on stored role
        localStorage.getItem("role") === "employee" ? (
          <EmployeeDashboard onLogout={handleLogout} />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )
      ) : (
        <Login ref={loginRef} onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
