import { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI, leaveAPI } from '../../services/api';
import { FiUsers, FiCheckCircle, FiClock, FiDollarSign, FiUserPlus, FiCalendar, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import './Dashboard.css';

const AdminDashboard = () => {
    const [statistics, setStatistics] = useState({
        totalEmployees: 0,
        presentToday: 0,
        pendingLeaves: 0,
        monthlyPayroll: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all employees
            const employeesRes = await employeeAPI.getAll();
            const employees = employeesRes.data;

            // Fetch today's attendance
            const today = new Date().toISOString().split('T')[0];
            const attendanceRes = await attendanceAPI.getAll({
                startDate: today,
                endDate: today
            });
            const todayAttendance = attendanceRes.data;

            // Fetch all leaves
            const leavesRes = await leaveAPI.getAll();
            const leaves = leavesRes.data;

            // Calculate statistics
            const totalEmployees = employees.length;
            const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
            const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

            // Calculate monthly payroll (sum of all employee salaries)
            const monthlyPayroll = employees.reduce((sum, emp) => {
                return sum + (emp.grossSalary || 0);
            }, 0);

            setStatistics({
                totalEmployees,
                presentToday,
                pendingLeaves,
                monthlyPayroll
            });

            // Prepare recent activities
            const activities = [
                ...leaves.slice(0, 3).map(leave => ({
                    type: 'leave',
                    message: `${leave.employee?.firstName} ${leave.employee?.lastName} applied for ${leave.leaveType} leave`,
                    time: new Date(leave.createdAt).toLocaleString(),
                    status: leave.status
                })),
                ...employees.slice(-2).map(emp => ({
                    type: 'employee',
                    message: `New employee ${emp.firstName} ${emp.lastName} joined`,
                    time: new Date(emp.createdAt).toLocaleString(),
                    status: 'New'
                }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

            setRecentActivities(activities);

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

    const statCards = [
        {
            title: 'Total Employees',
            value: statistics.totalEmployees,
            icon: <FiUsers />,
            color: 'primary',
            link: '/admin/employees'
        },
        {
            title: 'Present Today',
            value: statistics.presentToday,
            icon: <FiCheckCircle />,
            color: 'success',
            link: '/admin/attendance'
        },
        {
            title: 'Pending Leaves',
            value: statistics.pendingLeaves,
            icon: <FiClock />,
            color: 'warning',
            link: '/admin/leaves'
        },
        {
            title: 'Monthly Payroll',
            value: `₹${statistics.monthlyPayroll.toLocaleString()}`,
            icon: <FiDollarSign />,
            color: 'info',
            link: '/admin/payroll'
        }
    ];

    const quickActions = [
        {
            title: 'Add Employee',
            icon: <FiUserPlus />,
            link: '/admin/employees',
            color: 'primary'
        },
        {
            title: 'Mark Attendance',
            icon: <FiCalendar />,
            link: '/admin/attendance',
            color: 'success'
        },
        {
            title: 'Approve Leaves',
            icon: <FiCheckCircle />,
            link: '/admin/leaves',
            color: 'warning'
        },
        {
            title: 'Generate Reports',
            icon: <FiFileText />,
            link: '/admin/payroll',
            color: 'info'
        }
    ];

    return (
        <Layout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <div>
                        <h2 className="dashboard-title">Admin Dashboard</h2>
                        <p className="dashboard-subtitle">Overview of your organization</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    {statCards.map((stat, index) => (
                        <Link
                            key={index}
                            to={stat.link}
                            className={`stat-card stat-${stat.color}`}
                        >
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.title}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="dashboard-grid">
                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Quick Actions</h3>
                        </div>
                        <div className="quick-actions-grid">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    to={action.link}
                                    className={`action-card action-${action.color}`}
                                >
                                    <div className="action-icon">{action.icon}</div>
                                    <div className="action-title">{action.title}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Recent Activities</h3>
                        </div>
                        {recentActivities.length > 0 ? (
                            <div className="activities-list">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className={`activity-indicator activity-${activity.type}`}></div>
                                        <div className="activity-content">
                                            <div className="activity-message">{activity.message}</div>
                                            <div className="activity-time">{activity.time}</div>
                                        </div>
                                        <span className={`badge badge-${activity.status === 'Pending' ? 'warning' :
                                                activity.status === 'Approved' ? 'success' :
                                                    activity.status === 'New' ? 'info' : 'secondary'
                                            }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted text-center" style={{ padding: '2rem' }}>
                                No recent activities
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
