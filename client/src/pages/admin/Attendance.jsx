import { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../../services/api';
import { FiCalendar, FiClock, FiEdit2, FiPlus, FiX } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import './Attendance.css';

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('mark'); // 'mark' or 'edit'
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        employee: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'Present'
    });

    useEffect(() => {
        fetchEmployees();
        fetchAttendance();
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [dateRange]);

    const fetchEmployees = async () => {
        try {
            const response = await employeeAPI.getAll();
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const response = await attendanceAPI.getAll(dateRange);
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setMessage({ type: 'error', text: 'Failed to load attendance records' });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = () => {
        setModalMode('mark');
        setFormData({
            employee: '',
            date: new Date().toISOString().split('T')[0],
            checkIn: '09:00',
            checkOut: '18:00',
            status: 'Present'
        });
        setShowModal(true);
    };

    const handleEdit = (record) => {
        setModalMode('edit');
        setSelectedRecord(record);
        setFormData({
            employee: record.employee._id,
            date: new Date(record.date).toISOString().split('T')[0],
            checkIn: record.checkIn ? new Date(record.checkIn).toTimeString().slice(0, 5) : '',
            checkOut: record.checkOut ? new Date(record.checkOut).toTimeString().slice(0, 5) : '',
            status: record.status
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setMessage({ type: '', text: '' });

            const submitData = {
                employee: formData.employee,
                date: formData.date,
                checkIn: formData.checkIn ? `${formData.date}T${formData.checkIn}:00` : undefined,
                checkOut: formData.checkOut ? `${formData.date}T${formData.checkOut}:00` : undefined,
                status: formData.status
            };

            if (modalMode === 'mark') {
                await attendanceAPI.mark(submitData);
                setMessage({ type: 'success', text: 'Attendance marked successfully' });
            } else {
                await attendanceAPI.update(selectedRecord._id, submitData);
                setMessage({ type: 'success', text: 'Attendance updated successfully' });
            }

            await fetchAttendance();
            setShowModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error saving attendance:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save attendance' });
        }
    };

    const calculateWorkingHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 'N/A';
        const diff = new Date(checkOut) - new Date(checkIn);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
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

    return (
        <Layout>
            <div className="admin-attendance-page">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Attendance Management</h2>
                        <p className="page-subtitle">View and manage employee attendance</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleMarkAttendance}>
                        <FiPlus /> Mark Attendance
                    </button>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Date Range Filter */}
                <div className="filters-section">
                    <div className="date-filter">
                        <label>
                            <FiCalendar />
                            <span>From:</span>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="form-input"
                            />
                        </label>
                        <label>
                            <span>To:</span>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="form-input"
                            />
                        </label>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="card">
                    {attendance.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Date</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Working Hours</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => (
                                        <tr key={record._id}>
                                            <td className="font-medium">
                                                {record.employee?.firstName} {record.employee?.lastName}
                                            </td>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
                                            <td>
                                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td>
                                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td>{calculateWorkingHours(record.checkIn, record.checkOut)}</td>
                                            <td>
                                                <span className={`badge badge-${record.status === 'Present' ? 'success' : 'error'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleEdit(record)}
                                                >
                                                    <FiEdit2 /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted text-center" style={{ padding: '2rem' }}>
                            No attendance records found for the selected date range
                        </p>
                    )}
                </div>

                {/* Mark/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {modalMode === 'mark' ? 'Mark Attendance' : 'Edit Attendance'}
                                </h3>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label className="form-label">Employee *</label>
                                        <select
                                            name="employee"
                                            value={formData.employee}
                                            onChange={handleChange}
                                            className="form-select"
                                            required
                                            disabled={modalMode === 'edit'}
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp._id} value={emp._id}>
                                                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Date *</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Check In Time</label>
                                            <input
                                                type="time"
                                                name="checkIn"
                                                value={formData.checkIn}
                                                onChange={handleChange}
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Check Out Time</label>
                                            <input
                                                type="time"
                                                name="checkOut"
                                                value={formData.checkOut}
                                                onChange={handleChange}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Status *</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="Present">Present</option>
                                            <option value="Absent">Absent</option>
                                        </select>
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
                                        {modalMode === 'mark' ? 'Mark Attendance' : 'Update Attendance'}
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

export default AdminAttendance;
