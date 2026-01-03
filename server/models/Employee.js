import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Personal Details
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    profilePicture: {
        type: String,
        default: ''
    },

    // Job Details
    designation: {
        type: String,
        required: [true, 'Designation is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required'],
        default: Date.now
    },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
        default: 'Full-time'
    },

    // Salary Structure
    salary: {
        basic: {
            type: Number,
            default: 0
        },
        hra: {
            type: Number,
            default: 0
        },
        da: {
            type: Number,
            default: 0
        },
        ta: {
            type: Number,
            default: 0
        },
        otherAllowances: {
            type: Number,
            default: 0
        },
        pf: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        otherDeductions: {
            type: Number,
            default: 0
        }
    },

    // Documents
    documents: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Leave Balance
    leaveBalance: {
        paid: {
            type: Number,
            default: 20
        },
        sick: {
            type: Number,
            default: 10
        },
        casual: {
            type: Number,
            default: 12
        }
    }
}, {
    timestamps: true
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for gross salary
employeeSchema.virtual('grossSalary').get(function () {
    return this.salary.basic + this.salary.hra + this.salary.da + this.salary.ta + this.salary.otherAllowances;
});

// Virtual for net salary
employeeSchema.virtual('netSalary').get(function () {
    const gross = this.grossSalary;
    const deductions = this.salary.pf + this.salary.tax + this.salary.otherDeductions;
    return gross - deductions;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
