import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
    try {
        const { employeeId, email, password, role, firstName, lastName, designation, department } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { employeeId }] });

        if (userExists) {
            return res.status(400).json({
                message: userExists.email === email ? 'Email already registered' : 'Employee ID already exists'
            });
        }

        // Create user
        const user = await User.create({
            employeeId,
            email,
            password,
            role: role || 'Employee'
        });

        // Create employee profile
        const employee = await Employee.create({
            user: user._id,
            firstName: firstName || '',
            lastName: lastName || '',
            designation: designation || 'Not Assigned',
            department: department || 'Not Assigned'
        });

        if (user && employee) {
            res.status(201).json({
                _id: user._id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/signin
// @access  Public
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Your account has been deactivated' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Get employee profile
        const employee = await Employee.findOne({ user: user._id });

        res.json({
            _id: user._id,
            employeeId: user.employeeId,
            email: user.email,
            role: user.role,
            employee: employee ? {
                _id: employee._id,
                fullName: employee.fullName,
                designation: employee.designation,
                department: employee.department,
                profilePicture: employee.profilePicture
            } : null,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const employee = await Employee.findOne({ user: req.user._id });

        res.json({
            _id: user._id,
            employeeId: user.employeeId,
            email: user.email,
            role: user.role,
            employee: employee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
