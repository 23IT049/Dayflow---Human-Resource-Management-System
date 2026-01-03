import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['Paid', 'Sick', 'Casual', 'Unpaid'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    numberOfDays: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    adminComments: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Calculate number of days before saving
leaveSchema.pre('save', function (next) {
    if (this.startDate && this.endDate) {
        const diff = this.endDate - this.startDate;
        this.numberOfDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }
    next();
});

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
