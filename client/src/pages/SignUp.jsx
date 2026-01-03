import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const SignUp = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        employeeId: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Employee',
        firstName: '',
        lastName: '',
        designation: '',
        department: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { confirmPassword, ...signupData } = formData;
        const result = await signup(signupData);

        if (result.success) {
            // Redirect based on role
            if (result.user.role === 'Admin' || result.user.role === 'HR') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card auth-card-large">
                <div className="auth-header">
                    <h1 className="auth-title">Dayflow</h1>
                    <p className="auth-subtitle">Every workday, perfectly aligned</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <h2 className="form-title">Create Account</h2>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="firstName">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="form-input"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="lastName">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className="form-input"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="employeeId">
                            Employee ID
                        </label>
                        <input
                            type="text"
                            id="employeeId"
                            name="employeeId"
                            className="form-input"
                            placeholder="Enter employee ID"
                            value={formData.employeeId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="designation">
                                Designation
                            </label>
                            <input
                                type="text"
                                id="designation"
                                name="designation"
                                className="form-input"
                                placeholder="Job title"
                                value={formData.designation}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="department">
                                Department
                            </label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                className="form-input"
                                placeholder="Department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="Employee">Employee</option>
                            <option value="HR">HR</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="Create password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner spinner-sm"></span>
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <p className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/signin" className="auth-link">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
