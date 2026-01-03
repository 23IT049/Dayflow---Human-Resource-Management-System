import { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { FiCalendar, FiPlus, FiX, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import './Leave.css';

const Leave = () => {
    const [leaves, setLeaves] = useState([]);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [statusFilter, setStatusFilter] = useState('All');
    const [formData, setFormData] = useState({
        leaveType: 'Paid',
        startDate: '',
        endDate: '',
        reason: '',
        isHalfDay: false
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchLeaveData();
    }, []);

    const fetchLeaveData = async () => {
        try {
            setLoading(true);

            // Fetch leave balance
            const balanceRes = await leaveAPI.getBalance();
            setLeaveBalance(balanceRes.data);

            // Fetch leave history
            const leavesRes = await leaveAPI.getMy();
            setLeaves(leavesRes.data);
        } catch (error) {
            console.error('Error fetching leave data:', error);
            setMessage({ type: 'error', text: 'Failed to load leave data' });
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'End date is required';
        }

        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }

        if (!formData.reason.trim()) {
            newErrors.reason = 'Reason is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setMessage({ type: '', text: '' });

            await leaveAPI.apply(formData);

            setMessage({ type: 'success', text: 'Leave application submitted successfully!' });
            setShowModal(false);
            setFormData({
                leaveType: 'Paid',
                startDate: '',
                endDate: '',
                reason: '',
                isHalfDay: false
            });
            await fetchLeaveData();

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error applying for leave:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to apply for leave'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (leaveId) => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) {
            return;
        }

        try {
            setMessage({ type: '', text: '' });
            await leaveAPI.cancel(leaveId);

            setMessage({ type: 'success', text: 'Leave request cancelled successfully!' });
            await fetchLeaveData();

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error cancelling leave:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to cancel leave'
            });
        }
    };

    const filteredLeaves = statusFilter === 'All'
        ? leaves
        : leaves.filter(leave => leave.status === statusFilter);

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
            <div className="leave-page">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Leave Management</h2>
                        <p className="page-subtitle">Apply for leave and track your requests</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <FiPlus /> Apply for Leave
                    </button>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Leave Balance */}
                {leaveBalance && (
                    <div className="leave-balance-section">
                        <h3 className="section-title">Leave Balance</h3>
                        <div className="balance-grid">
                            <div className="balance-card balance-paid">
                                <div className="balance-icon">
                                    <FiCalendar />
                                </div>
                                <div className="balance-content">
                                    <div className="balance-value">{leaveBalance.paid}</div>
                                    <div className="balance-label">Paid Leave</div>
                                </div>
                            </div>
                            <div className="balance-card balance-sick">
                                <div className="balance-icon">
                                    <FiCalendar />
                                </div>
                                <div className="balance-content">
                                    <div className="balance-value">{leaveBalance.sick}</div>
                                    <div className="balance-label">Sick Leave</div>
                                </div>
                            </div>
                            <div className="balance-card balance-casual">
                                <div className="balance-icon">
                                    <FiCalendar />
                                </div>
                                <div className="balance-content">
                                    <div className="balance-value">{leaveBalance.casual}</div>
                                    <div className="balance-label">Casual Leave</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leave History */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Leave History</h3>
                        <div className="status-filters">
                            {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                                <button
                                    key={status}
                                    className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredLeaves.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeaves.map((leave) => (
                                        <tr key={leave._id}>
                                            <td>
                                                <span className={`type-badge type-${leave.leaveType.toLowerCase()}`}>
                                                    {leave.leaveType}
                                                </span>
                                            </td>
                                            <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                            <td>{leave.numberOfDays} {leave.isHalfDay ? '(Half)' : ''}</td>
                                            <td className="reason-cell">{leave.reason}</td>
                                            <td>
                                                <span className={`badge badge-${leave.status === 'Approved' ? 'success' :
                                                        leave.status === 'Rejected' ? 'error' : 'warning'
                                                    }`}>
                                                    {leave.status === 'Approved' && <FiCheckCircle />}
                                                    {leave.status === 'Rejected' && <FiXCircle />}
                                                    {leave.status === 'Pending' && <FiClock />}
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td>
                                                {leave.status === 'Pending' && (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleCancel(leave._id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
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

                {/* Apply Leave Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Apply for Leave</h3>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowModal(false)}
                                >
                                    <FiX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Leave Type</label>
                                    <select
                                        name="leaveType"
                                        value={formData.leaveType}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="Paid">Paid Leave</option>
                                        <option value="Sick">Sick Leave</option>
                                        <option value="Casual">Casual Leave</option>
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className={`form-input ${errors.startDate ? 'error' : ''}`}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.startDate && (
                                            <span className="form-error">{errors.startDate}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className={`form-input ${errors.endDate ? 'error' : ''}`}
                                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.endDate && (
                                            <span className="form-error">{errors.endDate}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isHalfDay"
                                            checked={formData.isHalfDay}
                                            onChange={handleChange}
                                        />
                                        <span>Half Day Leave</span>
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Reason</label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        className={`form-textarea ${errors.reason ? 'error' : ''}`}
                                        placeholder="Enter reason for leave"
                                        rows="4"
                                    />
                                    {errors.reason && (
                                        <span className="form-error">{errors.reason}</span>
                                    )}
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="spinner spinner-sm"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Application'
                                        )}
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

export default Leave;
