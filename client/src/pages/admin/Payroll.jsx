import { useState, useEffect } from 'react';
import { employeeAPI } from '../../services/api';
import { FiEdit2, FiDownload } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import Layout from '../../components/Layout/Layout';
import './Payroll.css';

const AdminPayroll = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [salaryData, setSalaryData] = useState({
        basic: 0,
        hra: 0,
        da: 0,
        ta: 0,
        otherAllowances: 0,
        pf: 0,
        tax: 0,
        otherDeductions: 0
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getAll();
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setMessage({ type: 'error', text: 'Failed to load employee data' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditSalary = (employee) => {
        setSelectedEmployee(employee);
        setSalaryData(employee.salary || {
            basic: 0,
            hra: 0,
            da: 0,
            ta: 0,
            otherAllowances: 0,
            pf: 0,
            tax: 0,
            otherDeductions: 0
        });
        setShowEditModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSalaryData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setMessage({ type: '', text: '' });
            await employeeAPI.update(selectedEmployee._id, { salary: salaryData });
            setMessage({ type: 'success', text: 'Salary updated successfully' });
            await fetchEmployees();
            setShowEditModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating salary:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update salary' });
        }
    };

    const calculateTotals = () => {
        const totalGross = employees.reduce((sum, emp) => sum + (emp.grossSalary || 0), 0);
        const totalNet = employees.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);
        const totalDeductions = totalGross - totalNet;
        const avgSalary = employees.length > 0 ? totalGross / employees.length : 0;

        // Department-wise breakdown
        const deptBreakdown = {};
        employees.forEach(emp => {
            const dept = emp.department || 'Unassigned';
            if (!deptBreakdown[dept]) {
                deptBreakdown[dept] = {
                    count: 0,
                    totalGross: 0,
                    totalNet: 0
                };
            }
            deptBreakdown[dept].count++;
            deptBreakdown[dept].totalGross += emp.grossSalary || 0;
            deptBreakdown[dept].totalNet += emp.netSalary || 0;
        });

        return { totalGross, totalNet, totalDeductions, avgSalary, deptBreakdown };
    };

    const { totalGross, totalNet, totalDeductions, avgSalary, deptBreakdown } = calculateTotals();

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="admin-payroll-page">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Payroll Management</h2>
                        <p className="page-subtitle">Manage employee salaries and generate payroll reports</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setMessage({ type: 'info', text: 'Bulk salary slip generation feature coming soon!' })}>
                        <FiDownload /> Generate Slips
                    </button>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Payroll Summary */}
                <div className="payroll-summary">
                    <div className="summary-card card-gradient-1">
                        <div className="summary-icon">
                            <FaRupeeSign />
                        </div>
                        <div className="summary-content">
                            <div className="summary-label">Total Monthly Payroll</div>
                            <div className="summary-value">₹{totalGross.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="summary-card card-gradient-2">
                        <div className="summary-icon">
                            <FaRupeeSign />
                        </div>
                        <div className="summary-content">
                            <div className="summary-label">Total Net Salary</div>
                            <div className="summary-value">₹{totalNet.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="summary-card card-gradient-3">
                        <div className="summary-icon">
                            <FaRupeeSign />
                        </div>
                        <div className="summary-content">
                            <div className="summary-label">Total Deductions</div>
                            <div className="summary-value">₹{totalDeductions.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon icon-primary">
                            <FaRupeeSign />
                        </div>
                        <div className="summary-content">
                            <div className="summary-label">Average Salary</div>
                            <div className="summary-value">₹{avgSalary.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Payroll Table */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Employee Salary Details</h3>
                    </div>
                    {employees.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Basic</th>
                                        <th>Allowances</th>
                                        <th>Gross</th>
                                        <th>Deductions</th>
                                        <th>Net Salary</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((employee) => {
                                        const salary = employee.salary || {};
                                        const allowances = (salary.hra || 0) + (salary.da || 0) + (salary.ta || 0) + (salary.otherAllowances || 0);
                                        const deductions = (salary.pf || 0) + (salary.tax || 0) + (salary.otherDeductions || 0);
                                        const gross = employee.grossSalary || 0;
                                        const net = employee.netSalary || 0;

                                        return (
                                            <tr key={employee._id}>
                                                <td>
                                                    <div className="employee-cell">
                                                        <div className="employee-avatar">
                                                            {employee.firstName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                                            <div className="text-muted text-sm">{employee.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-gray">{employee.department}</span>
                                                </td>
                                                <td>₹{(salary.basic || 0).toLocaleString()}</td>
                                                <td>₹{allowances.toLocaleString()}</td>
                                                <td className="font-semibold">₹{gross.toLocaleString()}</td>
                                                <td className="text-error">₹{deductions.toLocaleString()}</td>
                                                <td className="font-semibold text-success">₹{net.toLocaleString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-icon btn-secondary"
                                                        onClick={() => handleEditSalary(employee)}
                                                        title="Edit Salary"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="text-muted">No employees found</p>
                        </div>
                    )}
                </div>

                {/* Edit Salary Modal */}
                {showEditModal && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <h3 className="modal-title">Edit Salary Structure</h3>
                                    <p className="modal-subtitle">
                                        Update salary details for <span className="text-primary font-medium">{selectedEmployee?.firstName} {selectedEmployee?.lastName}</span>
                                    </p>
                                </div>
                                <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="salary-grid">
                                        <div className="salary-section">
                                            <h4 className="section-title text-success">Earnings</h4>
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label className="form-label">Basic Salary</label>
                                                    <div className="input-with-icon">
                                                        <span className="input-icon">₹</span>
                                                        <input
                                                            type="number"
                                                            name="basic"
                                                            value={salaryData.basic}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">HRA</label>
                                                    <div className="input-with-icon">
                                                        <span className="input-icon">₹</span>
                                                        <input
                                                            type="number"
                                                            name="hra"
                                                            value={salaryData.hra}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">DA</label>
                                                    <div className="input-with-icon">
                                                        <span className="input-icon">₹</span>
                                                        <input
                                                            type="number"
                                                            name="da"
                                                            value={salaryData.da}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">TA</label>
                                                    <div className="input-with-icon">
                                                        <span className="input-icon">₹</span>
                                                        <input
                                                            type="number"
                                                            name="ta"
                                                            value={salaryData.ta}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Other Allowances</label>
                                                    <div className="input-with-icon">
                                                        <span className="input-icon">₹</span>
                                                        <input
                                                            type="number"
                                                            name="otherAllowances"
                                                            value={salaryData.otherAllowances}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="salary-section">
                                            <h4 className="section-title text-error">Deductions</h4>
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label className="form-label">Provident Fund (PF)</label>
                                                    <div className="input-with-icon">
                                                        <span className="input-icon">₹</span>
                                                        <input
                                                            type="number"
                                                            name="pf"
                                                            value={salaryData.pf}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Income Tax (TDS)</label>
                                                    <div className="input-with-icon">
                                                        <span className="input-icon">₹</span>
                                                        <input
                                                            type="number"
                                                            name="tax"
                                                            value={salaryData.tax}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Other Deductions</label>
                                                    <div className="input-with-icon">
                                                        <span className="input-icon">₹</span>
                                                        <input
                                                            type="number"
                                                            name="otherDeductions"
                                                            value={salaryData.otherDeductions}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update Salary Structure
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminPayroll;
