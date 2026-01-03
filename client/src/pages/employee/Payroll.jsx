import { useState, useEffect } from 'react';
import { employeeAPI } from '../../services/api';
import { FiDollarSign, FiDownload, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import './Payroll.css';

const Payroll = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPayrollData();
    }, []);

    const fetchPayrollData = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getProfile();
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching payroll data:', error);
            setMessage({ type: 'error', text: 'Failed to load payroll data' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        setMessage({
            type: 'info',
            text: 'Salary slip download feature will be available soon!'
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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

    const salary = profile?.salary || {
        basic: 0,
        hra: 0,
        da: 0,
        ta: 0,
        otherAllowances: 0,
        pf: 0,
        tax: 0,
        otherDeductions: 0
    };

    // Calculate totals from actual salary data
    const earnings = {
        basic: salary.basic || 0,
        hra: salary.hra || 0,
        da: salary.da || 0,
        ta: salary.ta || 0,
        otherAllowances: salary.otherAllowances || 0
    };

    const deductions = {
        pf: salary.pf || 0,
        tax: salary.tax || 0,
        otherDeductions: salary.otherDeductions || 0
    };

    const totalEarnings = Object.values(earnings).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    const netSalary = totalEarnings - totalDeductions;
    const annualCTC = totalEarnings * 12;

    // Generate payment history for last 6 months
    const generatePaymentHistory = () => {
        const history = [];
        const currentDate = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            history.push({
                month: monthName,
                gross: totalEarnings,
                deductions: totalDeductions,
                net: netSalary,
                status: i === 0 ? 'Processing' : 'Paid',
                date: date
            });
        }

        return history;
    };

    const paymentHistory = generatePaymentHistory();

    return (
        <Layout>
            <div className="payroll-page">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Payroll Information</h2>
                        <p className="page-subtitle">View your salary details and payment history</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Salary Overview */}
                <div className="salary-overview">
                    <div className="overview-card overview-primary">
                        <div className="overview-icon">
                            <FiDollarSign />
                        </div>
                        <div className="overview-content">
                            <div className="overview-label">Gross Salary</div>
                            <div className="overview-value">₹{totalEarnings.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="overview-card overview-success">
                        <div className="overview-icon">
                            <FiTrendingUp />
                        </div>
                        <div className="overview-content">
                            <div className="overview-label">Annual CTC</div>
                            <div className="overview-value">₹{annualCTC.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="overview-card overview-info">
                        <div className="overview-icon">
                            <FiDollarSign />
                        </div>
                        <div className="overview-content">
                            <div className="overview-label">Net Salary</div>
                            <div className="overview-value">₹{netSalary.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Salary Breakdown */}
                <div className="salary-breakdown-section">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Salary Breakdown</h3>
                            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
                                <FiDownload /> Download Slip
                            </button>
                        </div>

                        <div className="breakdown-grid">
                            {/* Earnings */}
                            <div className="breakdown-column">
                                <div className="breakdown-header earnings-header">
                                    <FiTrendingUp />
                                    <span>Earnings</span>
                                </div>
                                <div className="breakdown-items">
                                    <div className="breakdown-item">
                                        <span className="item-label">Basic Salary</span>
                                        <span className="item-value">₹{earnings.basic.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span className="item-label">House Rent Allowance (HRA)</span>
                                        <span className="item-value">₹{earnings.hra.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span className="item-label">Dearness Allowance (DA)</span>
                                        <span className="item-value">₹{earnings.da.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span className="item-label">Transport Allowance (TA)</span>
                                        <span className="item-value">₹{earnings.ta.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span className="item-label">Other Allowances</span>
                                        <span className="item-value">₹{earnings.otherAllowances.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item breakdown-total">
                                        <span className="item-label">Total Earnings</span>
                                        <span className="item-value">₹{totalEarnings.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="breakdown-column">
                                <div className="breakdown-header deductions-header">
                                    <FiTrendingDown />
                                    <span>Deductions</span>
                                </div>
                                <div className="breakdown-items">
                                    <div className="breakdown-item">
                                        <span className="item-label">Provident Fund (PF)</span>
                                        <span className="item-value">₹{deductions.pf.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span className="item-label">Income Tax (TDS)</span>
                                        <span className="item-value">₹{deductions.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span className="item-label">Other Deductions</span>
                                        <span className="item-value">₹{deductions.otherDeductions.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item breakdown-total">
                                        <span className="item-label">Total Deductions</span>
                                        <span className="item-value">₹{totalDeductions.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="net-salary-banner">
                            <span className="net-label">Net Salary (Take Home)</span>
                            <span className="net-value">₹{netSalary.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Payment History</h3>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Gross Salary</th>
                                    <th>Deductions</th>
                                    <th>Net Salary</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map((payment, index) => (
                                    <tr key={index}>
                                        <td className="font-medium">{payment.month}</td>
                                        <td>₹{payment.gross.toLocaleString()}</td>
                                        <td className="text-error">-₹{payment.deductions.toLocaleString()}</td>
                                        <td className="font-semibold">₹{payment.net.toLocaleString()}</td>
                                        <td>
                                            <span className="badge badge-success">
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleDownload}
                                            >
                                                <FiDownload /> Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Payroll;
