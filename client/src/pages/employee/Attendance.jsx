import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import './Attendance.css';

const Attendance = () => {
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchAttendanceData();
    }, [dateRange]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);

            // Fetch today's attendance
            const today = new Date().toISOString().split('T')[0];
            const todayRes = await attendanceAPI.getMy({
                startDate: today,
                endDate: today
            });
            setTodayAttendance(todayRes.data[0] || null);

            // Fetch attendance history
            const historyRes = await attendanceAPI.getMy(dateRange);
            setAttendanceHistory(historyRes.data);

            // Calculate statistics
            calculateStatistics(historyRes.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setMessage({ type: 'error', text: 'Failed to load attendance data' });
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (data) => {
        const totalDays = data.length;
        const presentDays = data.filter(a => a.status === 'Present').length;
        const absentDays = data.filter(a => a.status === 'Absent').length;
        const totalHours = data.reduce((sum, a) => sum + (a.workingHours || 0), 0);
        const avgHours = totalDays > 0 ? totalHours / totalDays : 0;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

        // Calculate current streak
        let currentStreak = 0;
        const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const record of sortedData) {
            if (record.status === 'Present') {
                currentStreak++;
            } else {
                break;
            }
        }

        setStatistics({
            totalDays,
            presentDays,
            absentDays,
            avgHours: avgHours.toFixed(2),
            attendancePercentage,
            currentStreak
        });
    };

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            setMessage({ type: '', text: '' });

            await attendanceAPI.checkIn();

            setMessage({ type: 'success', text: 'Checked in successfully!' });
            await fetchAttendanceData();

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error checking in:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to check in'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setActionLoading(true);
            setMessage({ type: '', text: '' });

            await attendanceAPI.checkOut();

            setMessage({ type: 'success', text: 'Checked out successfully!' });
            await fetchAttendanceData();

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error checking out:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to check out'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    const isCheckedIn = todayAttendance && !todayAttendance.checkOut;
    const isCheckedOut = todayAttendance && todayAttendance.checkOut;

    return (
        <Layout>
            <div className="attendance-page">
                <div className="page-header">
                    <h2 className="page-title">Attendance Tracking</h2>
                    <p className="page-subtitle">Manage your daily attendance and view history</p>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Today's Status */}
                <div className="attendance-today">
                    <div className="today-status-card">
                        <div className="today-header">
                            <div>
                                <h3>Today's Status</h3>
                                <span className="today-date">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="live-clock">
                                <FiClock className="clock-icon" />
                                <span className="clock-time">
                                    {currentTime.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>

                        {todayAttendance ? (
                            <div className="today-details">
                                <div className="status-indicator status-present">
                                    <FiCheckCircle /> Marked Present
                                </div>
                                <div className="time-details">
                                    <div className="time-item">
                                        <span className="time-label">Check In</span>
                                        <span className="time-value">
                                            {new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    {todayAttendance.checkOut && (
                                        <>
                                            <div className="time-item">
                                                <span className="time-label">Check Out</span>
                                                <span className="time-value">
                                                    {new Date(todayAttendance.checkOut).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="time-item">
                                                <span className="time-label">Working Hours</span>
                                                <span className="time-value highlight">
                                                    {todayAttendance.workingHours.toFixed(2)} hrs
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="today-details">
                                <div className="status-indicator status-absent">
                                    <FiXCircle /> Not Checked In
                                </div>
                            </div>
                        )}

                        <div className="action-buttons">
                            {!todayAttendance && (
                                <button
                                    className="btn btn-primary btn-lg action-btn"
                                    onClick={handleCheckIn}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <div className="spinner spinner-sm"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FiClock /> Check In
                                        </>
                                    )}
                                </button>
                            )}
                            {isCheckedIn && (
                                <button
                                    className="btn btn-danger btn-lg action-btn"
                                    onClick={handleCheckOut}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <div className="spinner spinner-sm"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FiClock /> Check Out
                                        </>
                                    )}
                                </button>
                            )}
                            {isCheckedOut && (
                                <div className="completed-message">
                                    <FiCheckCircle /> You've completed your work for today!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    {statistics && (
                        <div className="statistics-grid">
                            <div className="stat-card stat-primary">
                                <div className="stat-icon">
                                    <FiCalendar />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{statistics.presentDays}/{statistics.totalDays}</div>
                                    <div className="stat-label">Days Present</div>
                                </div>
                            </div>
                            <div className="stat-card stat-success">
                                <div className="stat-icon">
                                    <FiCheckCircle />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{statistics.attendancePercentage}%</div>
                                    <div className="stat-label">Attendance Rate</div>
                                </div>
                            </div>
                            <div className="stat-card stat-info">
                                <div className="stat-icon">
                                    <FiClock />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{statistics.avgHours} hrs</div>
                                    <div className="stat-label">Avg Hours/Day</div>
                                </div>
                            </div>
                            <div className="stat-card stat-warning">
                                <div className="stat-icon">
                                    🔥
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{statistics.currentStreak}</div>
                                    <div className="stat-label">Day Streak</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Attendance History */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Attendance History</h3>
                        <div className="date-filters">
                            <div className="filter-group">
                                <label className="filter-label">From</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={dateRange.startDate}
                                    onChange={handleDateChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">To</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {attendanceHistory.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Working Hours</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceHistory.map((record) => (
                                        <tr key={record._id}>
                                            <td>
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                {record.checkIn
                                                    ? new Date(record.checkIn).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : '-'
                                                }
                                            </td>
                                            <td>
                                                {record.checkOut
                                                    ? new Date(record.checkOut).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : '-'
                                                }
                                            </td>
                                            <td>
                                                {record.workingHours > 0
                                                    ? `${record.workingHours.toFixed(2)} hrs`
                                                    : '-'
                                                }
                                            </td>
                                            <td>
                                                <span className={`badge badge-${record.status === 'Present' ? 'success' :
                                                    record.status === 'Absent' ? 'error' : 'warning'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted text-center" style={{ padding: '2rem' }}>
                            No attendance records found for the selected period
                        </p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Attendance;
