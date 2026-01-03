import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUser, FiClock, FiCalendar, FiDollarSign, FiUsers, FiCheckSquare, FiLogOut } from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children }) => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const employeeNav = [
        { path: '/employee/dashboard', icon: <FiHome />, label: 'Dashboard' },
        { path: '/employee/profile', icon: <FiUser />, label: 'Profile' },
        { path: '/employee/attendance', icon: <FiClock />, label: 'Attendance' },
        { path: '/employee/leave', icon: <FiCalendar />, label: 'Leave' },
        { path: '/employee/payroll', icon: <FiDollarSign />, label: 'Payroll' }
    ];

    const adminNav = [
        { path: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
        { path: '/admin/employees', icon: <FiUsers />, label: 'Employees' },
        { path: '/admin/attendance', icon: <FiCheckSquare />, label: 'Attendance' },
        { path: '/admin/leaves', icon: <FiCalendar />, label: 'Leaves' },
        { path: '/admin/payroll', icon: <FiDollarSign />, label: 'Payroll' }
    ];

    const navItems = isAdmin() ? adminNav : employeeNav;

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">Dayflow</h2>
                    <p className="sidebar-subtitle">HRMS</p>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <span className="nav-icon"><FiLogOut /></span>
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>

            <div className="main-content">
                <header className="topbar">
                    <div className="topbar-left">
                        <h1 className="page-title">
                            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="topbar-right">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.employee?.profilePicture ? (
                                    <img src={user.employee.profilePicture} alt="Profile" />
                                ) : (
                                    <span>{user?.employee?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="user-details">
                                <p className="user-name">{user?.employee?.fullName || user?.email}</p>
                                <p className="user-role">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
