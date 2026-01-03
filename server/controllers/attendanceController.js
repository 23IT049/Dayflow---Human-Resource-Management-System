import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        // Get today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        let attendance = await Attendance.findOne({
            employee: employee._id,
            date: today
        });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        if (!attendance) {
            attendance = new Attendance({
                employee: employee._id,
                date: today
            });
        }

        attendance.checkIn = new Date();
        attendance.status = 'Present';

        await attendance.save();

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private
export const checkOut = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        // Get today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employee: employee._id,
            date: today
        });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({ message: 'Please check in first' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        attendance.checkOut = new Date();

        await attendance.save();

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Private
export const getMyAttendance = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const { startDate, endDate } = req.query;

        let query = { employee: employee._id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query).sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all attendance (Admin)
// @route   GET /api/attendance/all
// @access  Private/Admin
export const getAllAttendance = async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;

        let query = {};

        if (employeeId) {
            query.employee = employeeId;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate({
                path: 'employee',
                populate: { path: 'user', select: 'employeeId email' }
            })
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark attendance (Admin)
// @route   POST /api/attendance/mark
// @access  Private/Admin
export const markAttendance = async (req, res) => {
    try {
        const { employee, date, status, checkIn, checkOut, remarks } = req.body;

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employee: employee,
            date: attendanceDate
        });

        if (attendance) {
            attendance.status = status;
            attendance.checkIn = checkIn ? new Date(checkIn) : attendance.checkIn;
            attendance.checkOut = checkOut ? new Date(checkOut) : attendance.checkOut;
            attendance.remarks = remarks || attendance.remarks;
        } else {
            attendance = new Attendance({
                employee: employee,
                date: attendanceDate,
                status,
                checkIn: checkIn ? new Date(checkIn) : null,
                checkOut: checkOut ? new Date(checkOut) : null,
                remarks: remarks || ''
            });
        }

        await attendance.save();

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update attendance (Admin)
// @route   PUT /api/attendance/:id
// @access  Private/Admin
export const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                attendance[key] = req.body[key];
            }
        });

        await attendance.save();

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
