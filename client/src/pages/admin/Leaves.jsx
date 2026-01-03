import { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { FiCheck, FiX, FiMessageSquare, FiFilter } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import './Leaves.css';

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
    const [comments, setComments] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchLeaves();
    }, []);

    useEffect(() => {
        filterLeavesByStatus();
    }, [filterStatus, leaves]);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const response = await leaveAPI.getAll();
            setLeaves(response.data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
            setMessage({ type: 'error', text: 'Failed to load leave requests' });
        } finally {
            setLoading(false);
        }
    };

    const filterLeavesByStatus = () => {
        if (filterStatus === 'All') {
            setFilteredLeaves(leaves);
        } else {
            setFilteredLeaves(leaves.filter(leave => leave.status === filterStatus));
        }
    };

    const handleApprove = (leave) => {
        setSelectedLeave(leave);
        setActionType('approve');
        setComments('');
        setShowCommentModal(true);
    };

    const handleReject = (leave) => {
        setSelectedLeave(leave);
        setActionType('reject');
        setComments('');
        setShowCommentModal(true);
    };

    const handleSubmitAction = async () => {
        try {
            setMessage({ type: '', text: '' });

            if (actionType === 'approve') {
                await leaveAPI.approve(selectedLeave._id, comments);
                setMessage({ type: 'success', text: 'Leave approved successfully' });
            } else {
                await leaveAPI.reject(selectedLeave._id, comments);
                setMessage({ type: 'success', text: 'Leave rejected successfully' });
            }

            await fetchLeaves();
            setShowCommentModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error processing leave:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process leave request' });
        }
    };

    const calculateDays = (startDate, endDate, isHalfDay) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return isHalfDay ? 0.5 : diffDays;
    };

    const stats = {
        pending: leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length
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
            <div className="admin-leaves-page">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Leave Management</h2>
                        <p className="page-subtitle">Review and manage leave requests</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Statistics */}
                <div className="leave-stats">
                    <div className="stat-box stat-warning">
                        <div className="stat-number">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-box stat-success">
                        <div className="stat-number">{stats.approved}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat-box stat-error">
                        <div className="stat-number">{stats.rejected}</div>
                        <div className="stat-label">Rejected</div>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="filters-section">
                    <div className="status-filters">
                        {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                            <button
                                key={status}
                                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                                onClick={() => setFilterStatus(status)}
                            >
                                <FiFilter /> {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaves Table */}
                <div className="card">
                    {filteredLeaves.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
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
                                            <td className="font-medium">
                                                {leave.employee?.firstName} {leave.employee?.lastName}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${leave.leaveType === 'Paid' ? 'success' :
                                                        leave.leaveType === 'Sick' ? 'warning' : 'info'
                                                    }`}>
                                                    {leave.leaveType}
                                                </span>
                                            </td>
                                            <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                            <td>{calculateDays(leave.startDate, leave.endDate, leave.isHalfDay)}</td>
                                            <td className="reason-cell">{leave.reason}</td>
                                            <td>
                                                <span className={`badge badge-${leave.status === 'Pending' ? 'warning' :
                                                        leave.status === 'Approved' ? 'success' : 'error'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td>
                                                {leave.status === 'Pending' ? (
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleApprove(leave)}
                                                        >
                                                            <FiCheck /> Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleReject(leave)}
                                                        >
                                                            <FiX /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">-</span>
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

                {/* Comment Modal */}
                {showCommentModal && (
                    <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                                </h3>
                                <button className="modal-close" onClick={() => setShowCommentModal(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="leave-details">
                                    <p><strong>Employee:</strong> {selectedLeave?.employee?.firstName} {selectedLeave?.employee?.lastName}</p>
                                    <p><strong>Type:</strong> {selectedLeave?.leaveType}</p>
                                    <p><strong>Duration:</strong> {new Date(selectedLeave?.startDate).toLocaleDateString()} - {new Date(selectedLeave?.endDate).toLocaleDateString()}</p>
                                    <p><strong>Reason:</strong> {selectedLeave?.reason}</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FiMessageSquare /> Comments (Optional)
                                    </label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        className="form-textarea"
                                        placeholder="Add any comments or notes..."
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCommentModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                    onClick={handleSubmitAction}
                                >
                                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminLeaves;
