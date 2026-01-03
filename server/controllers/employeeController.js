import Employee from '../models/Employee.js';
import User from '../models/User.js';

// @desc    Get employee profile
// @route   GET /api/employees/profile
// @access  Private
export const getMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id }).populate('user', '-password');

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get employee by ID (Admin)
// @route   GET /api/employees/:id
// @access  Private/Admin
export const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('user', '-password');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all employees (Admin)
// @route   GET /api/employees
// @access  Private/Admin
export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate('user', '-password').sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update employee profile
// @route   PUT /api/employees/profile
// @access  Private
export const updateMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        // Employees can only update limited fields
        const allowedFields = ['phone', 'address', 'profilePicture'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                employee[field] = req.body[field];
            }
        });

        const updatedEmployee = await employee.save();
        res.json(updatedEmployee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update employee by ID (Admin)
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Admin can update all fields
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined && key !== 'user') {
                employee[key] = req.body[key];
            }
        });

        const updatedEmployee = await employee.save();
        res.json(updatedEmployee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete employee (Admin)
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Delete associated user
        await User.findByIdAndDelete(employee.user);

        // Delete employee
        await employee.deleteOne();

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
