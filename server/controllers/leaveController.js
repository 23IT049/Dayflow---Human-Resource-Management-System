import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
export const applyLeave = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const { leaveType, startDate, endDate, reason } = req.body;

        // Calculate number of days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Check leave balance
        const leaveTypeKey = leaveType.toLowerCase();
        if (employee.leaveBalance[leaveTypeKey] !== undefined) {
            if (employee.leaveBalance[leaveTypeKey] < numberOfDays) {
                return res.status(400).json({
                    message: `Insufficient ${leaveType} leave balance. Available: ${employee.leaveBalance[leaveTypeKey]} days`
                });
            }
        }

        const leave = await Leave.create({
            employee: employee._id,
            leaveType,
            startDate,
            endDate,
            numberOfDays,
            reason
        });

        res.status(201).json(leave);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my
// @access  Private
export const getMyLeaves = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const leaves = await Leave.find({ employee: employee._id })
            .populate('reviewedBy', 'employeeId email')
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all leaves (Admin)
// @route   GET /api/leaves/all
// @access  Private/Admin
export const getAllLeaves = async (req, res) => {
    try {
        const { status, employeeId } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (employeeId) {
            query.employee = employeeId;
        }

        const leaves = await Leave.find(query)
            .populate({
                path: 'employee',
                populate: { path: 'user', select: 'employeeId email' }
            })
            .populate('reviewedBy', 'employeeId email')
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve leave (Admin)
// @route   PUT /api/leaves/:id/approve
// @access  Private/Admin
export const approveLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('employee');

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Leave request already processed' });
        }

        leave.status = 'Approved';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        leave.adminComments = req.body.comments || '';

        await leave.save();

        // Deduct from leave balance
        const employee = leave.employee;
        const leaveTypeKey = leave.leaveType.toLowerCase();

        if (employee.leaveBalance[leaveTypeKey] !== undefined) {
            employee.leaveBalance[leaveTypeKey] -= leave.numberOfDays;
            await employee.save();
        }

        res.json(leave);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject leave (Admin)
// @route   PUT /api/leaves/:id/reject
// @access  Private/Admin
export const rejectLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Leave request already processed' });
        }

        leave.status = 'Rejected';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        leave.adminComments = req.body.comments || '';

        await leave.save();

        res.json(leave);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Cancel leave
// @route   DELETE /api/leaves/:id
// @access  Private
export const cancelLeave = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Check if leave belongs to user
        if (leave.employee.toString() !== employee._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only cancel pending leave requests' });
        }

        await leave.deleteOne();

        res.json({ message: 'Leave request cancelled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get leave balance
// @route   GET /api/leaves/balance
// @access  Private
export const getLeaveBalance = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        res.json(employee.leaveBalance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
