import { useState, useEffect } from 'react';
import { employeeAPI } from '../../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSearch } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import './Employees.css';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        phone: '',
        address: '',
        designation: '',
        department: '',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'Full-time',
        salary: {
            basic: 0,
            hra: 0,
            da: 0,
            ta: 0,
            otherAllowances: 0,
            pf: 0,
            tax: 0,
            otherDeductions: 0
        }
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        filterEmployees();
    }, [searchTerm, filterDepartment, employees]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getAll();
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setMessage({ type: 'error', text: 'Failed to load employees' });
        } finally {
            setLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        if (searchTerm) {
            filtered = filtered.filter(emp =>
                `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterDepartment !== 'All') {
            filtered = filtered.filter(emp => emp.department === filterDepartment);
        }

        setFilteredEmployees(filtered);
    };

    const handleAdd = () => {
        setModalMode('add');
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            dateOfBirth: '',
            phone: '',
            address: '',
            designation: '',
            department: '',
            joiningDate: new Date().toISOString().split('T')[0],
            employmentType: 'Full-time',
            salary: {
                basic: 0,
                hra: 0,
                da: 0,
                ta: 0,
                otherAllowances: 0,
                pf: 0,
                tax: 0,
                otherDeductions: 0
            }
        });
        setShowModal(true);
    };

    const handleEdit = (employee) => {
        setModalMode('edit');
        setSelectedEmployee(employee);
        setFormData({
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            email: employee.email || '',
            dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
            phone: employee.phone || '',
            address: employee.address || '',
            designation: employee.designation || '',
            department: employee.department || '',
            joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
            employmentType: employee.employmentType || 'Full-time',
            salary: employee.salary || {
                basic: 0,
                hra: 0,
                da: 0,
                ta: 0,
                otherAllowances: 0,
                pf: 0,
                tax: 0,
                otherDeductions: 0
            }
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            return;
        }

        try {
            await employeeAPI.delete(id);
            setMessage({ type: 'success', text: 'Employee deleted successfully' });
            await fetchEmployees();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting employee:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete employee' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('salary.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                salary: {
                    ...prev.salary,
                    [field]: parseFloat(value) || 0
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setMessage({ type: '', text: '' });

            if (modalMode === 'add') {
                // For add, we need to create user first, but since we don't have that endpoint,
                // we'll show a message
                setMessage({ type: 'info', text: 'Add employee functionality requires user creation endpoint' });
            } else {
                await employeeAPI.update(selectedEmployee._id, formData);
                setMessage({ type: 'success', text: 'Employee updated successfully' });
                await fetchEmployees();
                setShowModal(false);
            }

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error saving employee:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save employee' });
        }
    };

    const departments = ['All', ...new Set(employees.map(emp => emp.department).filter(Boolean))];

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
            <div className="employees-page">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Employee Management</h2>
                        <p className="page-subtitle">Manage your organization's employees</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleAdd}>
                        <FiPlus /> Add Employee
                    </button>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="form-select"
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* Employee Table */}
                <div className="card">
                    {filteredEmployees.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Position</th>
                                        <th>Join Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee._id}>
                                            <td className="font-medium">{employee.employeeId}</td>
                                            <td>{employee.firstName} {employee.lastName}</td>
                                            <td>{employee.email}</td>
                                            <td>{employee.department}</td>
                                            <td>{employee.position}</td>
                                            <td>{new Date(employee.joiningDate).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleEdit(employee)}
                                                    >
                                                        <FiEdit2 /> Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(employee._id)}
                                                    >
                                                        <FiTrash2 /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted text-center" style={{ padding: '2rem' }}>
                            No employees found
                        </p>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {modalMode === 'add' ? 'Add New Employee' : 'Edit Employee'}
                                </h3>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-sections">
                                    {/* Personal Information */}
                                    <div className="modal-section">
                                        <h4 className="section-title">Personal Information</h4>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">First Name *</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Last Name *</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    required
                                                    disabled={modalMode === 'edit'}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={formData.dateOfBirth}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Phone</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label className="form-label">Address</label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Information */}
                                    <div className="modal-section">
                                        <h4 className="section-title">Job Information</h4>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Designation *</label>
                                                <input
                                                    type="text"
                                                    name="designation"
                                                    value={formData.designation}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Department *</label>
                                                <input
                                                    type="text"
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Joining Date *</label>
                                                <input
                                                    type="date"
                                                    name="joiningDate"
                                                    value={formData.joiningDate}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Employment Type</label>
                                                <select
                                                    name="employmentType"
                                                    value={formData.employmentType}
                                                    onChange={handleChange}
                                                    className="form-select"
                                                >
                                                    <option value="Full-time">Full-time</option>
                                                    <option value="Part-time">Part-time</option>
                                                    <option value="Contract">Contract</option>
                                                    <option value="Intern">Intern</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Salary Information */}
                                    <div className="modal-section">
                                        <h4 className="section-title">Salary Structure</h4>
                                        <div className="salary-grid">
                                            <div className="salary-column">
                                                <h5>Earnings</h5>
                                                <div className="form-group">
                                                    <label className="form-label">Basic</label>
                                                    <input
                                                        type="number"
                                                        name="salary.basic"
                                                        value={formData.salary.basic}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">HRA</label>
                                                    <input
                                                        type="number"
                                                        name="salary.hra"
                                                        value={formData.salary.hra}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">DA</label>
                                                    <input
                                                        type="number"
                                                        name="salary.da"
                                                        value={formData.salary.da}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">TA</label>
                                                    <input
                                                        type="number"
                                                        name="salary.ta"
                                                        value={formData.salary.ta}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Other Allowances</label>
                                                    <input
                                                        type="number"
                                                        name="salary.otherAllowances"
                                                        value={formData.salary.otherAllowances}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="salary-column">
                                                <h5>Deductions</h5>
                                                <div className="form-group">
                                                    <label className="form-label">PF</label>
                                                    <input
                                                        type="number"
                                                        name="salary.pf"
                                                        value={formData.salary.pf}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Tax</label>
                                                    <input
                                                        type="number"
                                                        name="salary.tax"
                                                        value={formData.salary.tax}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Other Deductions</label>
                                                    <input
                                                        type="number"
                                                        name="salary.otherDeductions"
                                                        value={formData.salary.otherDeductions}
                                                        onChange={handleChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {modalMode === 'add' ? 'Add Employee' : 'Update Employee'}
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

export default Employees;
