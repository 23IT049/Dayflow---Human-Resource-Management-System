import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI, attendanceAPI, leaveAPI } from '../../services/api';
import { FiUser, FiClock, FiCalendar, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import './Dashboard.css';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch profile
            const profileRes = await employeeAPI.getProfile();
            setProfile(profileRes.data);

            // Fetch today's attendance
            const today = new Date().toISOString().split('T')[0];
            const attendanceRes = await attendanceAPI.getMy({
                startDate: today,
                endDate: today
            });
            setTodayAttendance(attendanceRes.data[0] || null);

            // Fetch leave balance
            const balanceRes = await leaveAPI.getBalance();
            setLeaveBalance(balanceRes.data);

            // Fetch recent leaves
            const leavesRes = await leaveAPI.getMy();
            setRecentLeaves(leavesRes.data.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
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

    const quickAccessCards = [
        {
            title: 'Profile',
            icon: <FiUser />,
            link: '/employee/profile',
            color: 'purple',
            description: 'View and edit your profile'
        },
        {
            title: 'Attendance',
            icon: <FiClock />,
            link: '/employee/attendance',
            color: 'blue',
            description: 'Track your attendance'
        },
        {
            title: 'Leave Requests',
            icon: <FiCalendar />,
            link: '/employee/leave',
            color: 'green',
            description: 'Apply and manage leaves'
        },
        {
            title: 'Payroll',
            icon: <FiDollarSign />,
            link: '/employee/payroll',
            color: 'pink',
            description: 'View salary details'
        }
    ];

    return (
        <Layout>
            <div className="dashboard">
                <div className="welcome-section">
                    <h2 className="welcome-title">
                        Welcome back, {profile?.firstName || user?.email}! 👋
                    </h2>
                    <p className="welcome-subtitle">
                        Here's what's happening with your work today
                    </p>
                </div>

                {/* Quick Access Cards */}
                <div className="quick-access-grid">
                    {quickAccessCards.map((card) => (
                        <Link key={card.title} to={card.link} className={`quick-card card-${card.color}`}>
                            <div className="quick-card-icon">{card.icon}</div>
                            <div className="quick-card-content">
                                <h3 className="quick-card-title">{card.title}</h3>
                                <p className="quick-card-description">{card.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="dashboard-grid">
                    {/* Today's Attendance */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Today's Attendance</h3>
                        </div>
                        <div className="attendance-status">
                            {todayAttendance ? (
                                <>
                                    <div className="status-badge badge-success">
                                        <FiCheckCircle /> Checked In
                                    </div>
                                    <div className="attendance-details">
                                        <div className="attendance-item">
                                            <span className="label">Check In:</span>
                                            <span className="value">
                                                {new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        {todayAttendance.checkOut && (
                                            <div className="attendance-item">
                                                <span className="label">Check Out:</span>
                                                <span className="value">
                                                    {new Date(todayAttendance.checkOut).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {todayAttendance.workingHours > 0 && (
                                            <div className="attendance-item">
                                                <span className="label">Working Hours:</span>
                                                <span className="value">{todayAttendance.workingHours.toFixed(2)} hrs</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="status-badge badge-error">
                                        <FiXCircle /> Not Checked In
                                    </div>
                                    <Link to="/employee/attendance" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                                        Check In Now
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Leave Balance */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Leave Balance</h3>
                        </div>
                        {leaveBalance && (
                            <div className="leave-balance-grid">
                                <div className="balance-item">
                                    <div className="balance-label">Paid Leave</div>
                                    <div className="balance-value">{leaveBalance.paid} days</div>
                                </div>
                                <div className="balance-item">
                                    <div className="balance-label">Sick Leave</div>
                                    <div className="balance-value">{leaveBalance.sick} days</div>
                                </div>
                                <div className="balance-item">
                                    <div className="balance-label">Casual Leave</div>
                                    <div className="balance-value">{leaveBalance.casual} days</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Leave Requests */}
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header">
                            <h3 className="card-title">Recent Leave Requests</h3>
                            <Link to="/employee/leave" className="btn btn-secondary btn-sm">
                                View All
                            </Link>
                        </div>
                        {recentLeaves.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Days</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentLeaves.map((leave) => (
                                            <tr key={leave._id}>
                                                <td>{leave.leaveType}</td>
                                                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                                <td>{leave.numberOfDays}</td>
                                                <td>
                                                    <span className={`badge badge-${leave.status === 'Approved' ? 'success' :
                                                            leave.status === 'Rejected' ? 'error' : 'warning'
                                                        }`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted text-center" style={{ padding: '2rem' }}>
                                No leave requests found
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EmployeeDashboard;
