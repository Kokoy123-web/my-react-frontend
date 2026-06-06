import React, { useState, useEffect } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import './Attendance.css';

function Attendance({ onAttendanceUpdate }) {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [confirm, setConfirm] = useState({ show: false, message: "", onConfirm: null });

    // 1. Auto-refresh matag 5 segundos para updated ang dashboard
    useEffect(() => {
        fetchAttendanceRecords();
        const interval = setInterval(fetchAttendanceRecords, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAttendanceRecords = () => {
        axios.get("http://localhost:5000/attendance")
            .then((res) => {
                // Siguruha nga array ang nadawat
                if (Array.isArray(res.data)) {
                    setAttendanceRecords(res.data);
                }
            })
            .catch(() => {
                // Hilom lang kung naay error para dili samok sa dashboard
            });
    };

    const formatTime = (t) => {
        if (!t || t === "00:00:00") return "--";
        try {
            const parts = t.split(':');
            let hour = parseInt(parts[0], 10);
            const minute = parts[1];
            const ampm = hour >= 12 ? 'PM' : 'AM';
            if (hour === 0) hour = 12;
            if (hour > 12) hour -= 12;
            return `${hour}:${minute} ${ampm}`;
        } catch (e) {
            return t;
        }
    };

    const handleDelete = (id) => {
        setConfirm({
            show: true,
            message: "Are you sure want to delete this record?",
            onConfirm: async () => {
                try {
                    await axios.delete(`${process.env.REACT_APP_API_URL}/attendance/${id}`);
                    setAttendanceRecords(prev => prev.filter(r => r.id !== id));
                    if (onAttendanceUpdate) onAttendanceUpdate();
                } catch (e) {
                    // Handle error silently
                }
                setConfirm({ show: false, message: "", onConfirm: null });
            }
        });
    };

    return (
        <div className="attendance-container">
            <div className="header-flex">
                <h2>Attendance Dashboard</h2>
                <div className="live-status">
                    <span className="live-indicator">●</span> LIVE UPDATES
                </div>
            </div>

            <div className="attendance-records-section">
                <div className="table-container">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Date</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Status</th>
                                <th>Hours Worked</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        No attendance logs recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                attendanceRecords.map((record) => {
                                    const hours = calculateHours(record.time_in, record.time_out);
                                    return (
                                        <tr key={record.id}>
                                            <td className="emp-name">{record.employee_name || 'Unknown'}</td>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="time-cell">{formatTime(record.time_in)}</td>
                                            <td className="time-cell">{formatTime(record.time_out)}</td>
                                            <td>
                                                <span className={`status-badge ${record.status ? record.status.toLowerCase() : 'present'}`}>
                                                    {record.status || 'Present'}
                                                </span>
                                            </td>
                                            <td className="hours-cell">{hours}</td>
                                            <td>
                                                <button className="delete-icon-btn" onClick={() => handleDelete(record.id)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal 
                show={confirm.show} 
                message={confirm.message} 
                onConfirm={confirm.onConfirm} 
                onCancel={() => setConfirm({ show: false, message: "", onConfirm: null })} 
            />
        </div>
    );
}

function calculateHours(timeIn, timeOut) {
    if (!timeIn || !timeOut || timeOut === "00:00:00") return '-';
    try {
        const [inHour, inMin] = timeIn.split(':').map(Number);
        const [outHour, outMin] = timeOut.split(':').map(Number);
        
        let diffMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
        if (diffMinutes < 0) return '-'; // Proteksyon sa error logs

        const hrs = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return `${hrs}h ${mins}m`;
    } catch (e) {
        return '-';
    }
}

export default Attendance;
