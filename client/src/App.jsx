import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import Profile from './pages/employee/Profile';
import Attendance from './pages/employee/Attendance';
import Leave from './pages/employee/Leave';
import Payroll from './pages/employee/Payroll';

// Placeholder components for admin pages
const PlaceholderPage = ({ title }) => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>{title}</h2>
        <p>This page is under development</p>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />

                    {/* Employee Routes */}
                    <Route
                        path="/employee/dashboard"
                        element={
                            <ProtectedRoute>
                                <EmployeeDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employee/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employee/attendance"
                        element={
                            <ProtectedRoute>
                                <Attendance />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employee/leave"
                        element={
                            <ProtectedRoute>
                                <Leave />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employee/payroll"
                        element={
                            <ProtectedRoute>
                                <Payroll />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute adminOnly>
                                <PlaceholderPage title="Admin Dashboard" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/employees"
                        element={
                            <ProtectedRoute adminOnly>
                                <PlaceholderPage title="Manage Employees" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/attendance"
                        element={
                            <ProtectedRoute adminOnly>
                                <PlaceholderPage title="Manage Attendance" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/leaves"
                        element={
                            <ProtectedRoute adminOnly>
                                <PlaceholderPage title="Manage Leaves" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/payroll"
                        element={
                            <ProtectedRoute adminOnly>
                                <PlaceholderPage title="Manage Payroll" />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/signin" replace />} />
                    <Route path="*" element={<Navigate to="/signin" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
