import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmployeeProfile.css";

function splitFullName(full = "") {
  const trimmed = (full || "").trim();
  if (!trimmed) return { firstName: "", middleName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], middleName: "", lastName: parts[1] };
  if (parts.length === 3) return { firstName: parts[0], middleName: parts[1], lastName: parts[2] };
  return {
    firstName: parts.slice(0, -2).join(" "),
    middleName: parts[parts.length - 2],
    lastName: parts[parts.length - 1],
  };
}

function joinFullName({ firstName, middleName, lastName }) {
  return [firstName, middleName, lastName].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function EmployeeProfile({ employee, onEmployeeUpdated }) {
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (!employee) return;
    const { firstName, middleName, lastName } = splitFullName(employee.name || "");
    setProfileForm({
      firstName,
      middleName,
      lastName,
      email: employee.email || "",
      phone: employee.phone || "",
      password: "",
    });
  }, [employee]);

  useEffect(() => {
    if (!saveSuccess) return undefined;
    const timer = setTimeout(() => setSaveSuccess(""), 5000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  const savedDisplayName = employee?.name?.trim() || "—";
  const nameInitial = (savedDisplayName !== "—" ? savedDisplayName : "?").charAt(0).toUpperCase();

  const clearStatusMessages = () => {
    setSaveError("");
    setSaveSuccess("");
  };

  const updateProfileForm = (updates) => {
    clearStatusMessages();
    setProfileForm((prev) => ({ ...prev, ...updates }));
  };

  const employeeCode = employee.employee_code || employee.employeeCode || "--";
  const positionLabel = employee.position || "--";
  const departmentLabel = employee.department || "--";

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      setSaveError("Employee ID not found. Please login again.");
      return;
    }

    const name = joinFullName(profileForm);
    if (!name || !profileForm.email) {
      setSaveError("Name and username (email) are required.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const payload = {
        name,
        email: profileForm.email,
        phone: profileForm.phone || "",
      };
      if (profileForm.password && profileForm.password.trim()) {
        payload.password = profileForm.password;
      }
      await axios.put(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`, payload);
      const r = await axios.get(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`);
      if (onEmployeeUpdated) onEmployeeUpdated(r.data);
      setProfileForm((prev) => ({ ...prev, password: "" }));
      setSaveSuccess("Profile updated successfully!");
    } catch (err) {
      setSaveError(err.response?.data?.message || err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!employee) {
    return <div className="ed-loading">Loading profile...</div>;
  }

  return (
    <div className="ed-page ep-profile-page">
      <header className="ep-top-header">
        <h1 className="ep-title">My Profile</h1>
        <div className="ep-top-user">
          <div className="ep-top-avatar" aria-hidden="true">
            {nameInitial}
          </div>
          <div className="ep-top-user-text">
            <span className="ep-top-email">{employee.email || "—"}</span>
            <span className="ep-top-role">Employee</span>
          </div>
        </div>
      </header>

      <form className="ep-form-card" onSubmit={saveProfile} noValidate>
        <div className="ep-form-section-label">
          <span className="ep-form-section-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span>MY PROFILE</span>
        </div>

        <div className="ep-form-hero">
          <div className="ep-form-hero-avatar" aria-hidden="true">
            {nameInitial}
          </div>
          <div className="ep-form-hero-text">
            <div className="ep-form-hero-name">{savedDisplayName}</div>
            <div className="ep-form-hero-meta">
              {employeeCode} · {positionLabel}
            </div>
          </div>
        </div>

        <div className="ep-form-grid ep-form-grid-3">
          <div className="ep-field">
            <label htmlFor="ep-first-name">FIRST NAME</label>
            <input
              id="ep-first-name"
              value={profileForm.firstName}
              onChange={(e) => updateProfileForm({ firstName: e.target.value })}
              autoComplete="given-name"
            />
          </div>
          <div className="ep-field">
            <label htmlFor="ep-middle-name">MIDDLE NAME</label>
            <input
              id="ep-middle-name"
              value={profileForm.middleName}
              onChange={(e) => updateProfileForm({ middleName: e.target.value })}
              autoComplete="additional-name"
            />
          </div>
          <div className="ep-field">
            <label htmlFor="ep-last-name">LAST NAME</label>
            <input
              id="ep-last-name"
              value={profileForm.lastName}
              onChange={(e) => updateProfileForm({ lastName: e.target.value })}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="ep-form-grid ep-form-grid-3">
          <div className="ep-field">
            <label htmlFor="ep-dept">DEPARTMENT</label>
            <input id="ep-dept" value={departmentLabel} readOnly className="ep-input-readonly" tabIndex={-1} />
          </div>
          <div className="ep-field">
            <label htmlFor="ep-position">POSITION</label>
            <input id="ep-position" value={positionLabel} readOnly className="ep-input-readonly" tabIndex={-1} />
          </div>
          <div className="ep-field">
            <label htmlFor="ep-username">USERNAME</label>
            <input
              id="ep-username"
              type="email"
              value={profileForm.email}
              onChange={(e) => updateProfileForm({ email: e.target.value })}
              autoComplete="username"
            />
          </div>
        </div>

        <div className="ep-field ep-field-full">
          <label htmlFor="ep-phone">PHONE NUMBER</label>
          <input
            id="ep-phone"
            type="tel"
            value={profileForm.phone}
            onChange={(e) => updateProfileForm({ phone: e.target.value })}
            placeholder="e.g. 09171234567"
            autoComplete="tel"
          />
        </div>

        <div className="ep-field ep-field-full">
          <label htmlFor="ep-password">NEW PASSWORD (OPTIONAL)</label>
          <input
            id="ep-password"
            type="password"
            value={profileForm.password}
            onChange={(e) => updateProfileForm({ password: e.target.value })}
            placeholder="Leave blank to keep current password"
            autoComplete="new-password"
          />
        </div>

        {saveSuccess && (
          <div className="ep-form-success" role="status">
            {saveSuccess}
          </div>
        )}
        {saveError && <div className="ep-form-error">{saveError}</div>}

        <div className="ep-form-actions">
          <button type="submit" className="ep-save-btn" disabled={isSaving}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 4h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M14 4v5h5M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      <section className="ep-info-section" aria-labelledby="ep-info-heading">
        <div className="ep-info-section-label" id="ep-info-heading">
          <span className="ep-form-section-icon ep-info-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 10v6M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span>PROFILE INFORMATION</span>
        </div>
        <div className="ep-info-cards">
          <div className="ep-info-card">
            <span className="ep-info-card-label">EMPLOYEE ID</span>
            <strong className="ep-info-card-value">{employeeCode}</strong>
          </div>
          <div className="ep-info-card">
            <span className="ep-info-card-label">DEPARTMENT</span>
            <strong className="ep-info-card-value">{departmentLabel}</strong>
          </div>
          <div className="ep-info-card">
            <span className="ep-info-card-label">POSITION</span>
            <strong className="ep-info-card-value">{positionLabel}</strong>
          </div>
          <div className="ep-info-card">
            <span className="ep-info-card-label">USERNAME</span>
            <strong className="ep-info-card-value">{employee.email || "—"}</strong>
          </div>
          <div className="ep-info-card">
            <span className="ep-info-card-label">PHONE NUMBER</span>
            <strong className="ep-info-card-value">{employee.phone || "—"}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EmployeeProfile;
