import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAs, setLoginAs] = useState("employee");

  const leftMessage = {
    title: "Employee Management System",
    description:
      "Access your dashboard to manage attendance, employee records, and department information easily.",
    features: [
      {
        icon: "user",
        label: "Employee Records"
      },
      {
        icon: "attendance",
        label: "Attendance Tracking"
      },
      {
        icon: "building",
        label: "Department Management"
      }
    ]
  };

  const featureIconClass = (icon) => {
    if (icon === "user") return "bi bi-person-fill";
    if (icon === "attendance") return "bi bi-clipboard2-check-fill";
    return "bi bi-building-fill";
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rememberMe) {
      setError("Please check 'Agree terms and condition' to log in.");
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        username: formData.username,
        password: formData.password
      });

      if (response.data.success) {
        const accountRole = response.data.user.role;
        if (loginAs === "employee" && accountRole !== "employee") {
          setError("Invalid Username or Password.");
          setLoading(false);
          return;
        }
        if (loginAs === "admin" && accountRole === "employee") {
          setError("Invalid Username or Password.");
          setLoading(false);
          return;
        }

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userId", response.data.user.id);
        if (response.data.employeeId) {
          localStorage.setItem("employeeId", response.data.employeeId);
        }
        setLoading(false);
        onLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid username or password.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page container-fluid g-0">
      <div className="row g-0 min-vh-100">
        <div className="col-lg-6 login-left d-flex align-items-center justify-content-center">
          <div className="login-left-bg" aria-hidden="true">
            <span className="login-bg-circle login-bg-circle--1" />
            <span className="login-bg-circle login-bg-circle--2" />
            <span className="login-bg-circle login-bg-circle--3" />
            <span className="login-bg-circle login-bg-circle--4" />
            <span className="login-bg-circle login-bg-circle--5" />
          </div>
          <div className="login-left-inner text-center text-white px-4 px-xl-5">
            <div className="login-left-hero">
              <div className="login-brand-ring" aria-hidden="true">
                <i className="bi bi-people-fill login-brand-icon" />
              </div>
              <div className="login-left-copy">
                <h1 className="login-left-title fw-bold">{leftMessage.title}</h1>
                <p className="login-left-desc">{leftMessage.description}</p>
              </div>
            </div>
            <ul className="login-feature-list list-unstyled mb-0 text-start">
              {leftMessage.features.map((item) => (
                <li className="login-feature-item d-flex align-items-center gap-3" key={item.label}>
                  <span className="login-feature-icon flex-shrink-0">
                    <i className={featureIconClass(item.icon)} aria-hidden="true" />
                  </span>
                  <span className="login-feature-label">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-lg-6 login-right d-flex align-items-center justify-content-center">
          <div className="login-card card border-0 shadow">
            

            <div className="card-body login-card-body">
              <div className="login-header mb-3">
                <h2 className="login-welcome-title mb-1">Welcome Back!</h2>
              </div>

              <div className="form-welcome mb-4">
                <h3 className="h5 fw-bold login-signin-title mb-1">Sign in</h3>
                <p className="login-signin-subtitle mb-0">Please enter your details.</p>
              </div>

              <div
                className="login-role-toggle row g-2 mb-4"
                role="group"
                aria-label="Sign in as"
              >
                <div className="col-6">
                  <button
                    type="button"
                    className={`login-role-btn w-100 d-flex align-items-center justify-content-center gap-2 ${
                      loginAs === "employee" ? "is-active" : ""
                    }`}
                    onClick={() => {
                      setLoginAs("employee");
                      setError("");
                    }}
                    aria-pressed={loginAs === "employee"}
                  >
                    <i className="bi bi-person-fill" aria-hidden="true" />
                    <span>Employee</span>
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className={`login-role-btn w-100 d-flex align-items-center justify-content-center gap-2 ${
                      loginAs === "admin" ? "is-active" : ""
                    }`}
                    onClick={() => {
                      setLoginAs("admin");
                      setError("");
                    }}
                    aria-pressed={loginAs === "admin"}
                  >
                    <i className="bi bi-shield-lock-fill" aria-hidden="true" />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label login-field-label">
                    Email
                  </label>
                  <div className="input-group login-input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope" aria-hidden="true" />
                    </span>
                    <input
                      type="email"
                      id="username"
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label login-field-label">
                    Password
                  </label>
                  <div className="input-group login-input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill" aria-hidden="true" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="input-group-text login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <label className="remember-me d-flex align-items-center gap-2 mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input m-0"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Agree terms and condition</span>
                  </label>
                  <button type="button" className="btn btn-link forgot-password p-0">
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 login-error" role="alert">
                    <i className="bi bi-exclamation-circle-fill flex-shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn login-btn w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                  <span>{loading ? "Logging in..." : "Login"}</span>
                </button>
              </form>

              <footer className="login-card-footer text-center mt-4">
                <p className="mb-0">{leftMessage.title}</p>
                <p className="mb-0">© 2026 All rights reserved</p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
