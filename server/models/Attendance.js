import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half-day', 'Leave'],
        default: 'Absent'
    },
    workingHours: {
        type: Number,
        default: 0
    },
    remarks: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Calculate working hours before saving
attendanceSchema.pre('save', function (next) {
    if (this.checkIn && this.checkOut) {
        const diff = this.checkOut - this.checkIn;
        this.workingHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Hours with 2 decimal places

        // Auto-set status based on working hours
        if (this.workingHours >= 8) {
            this.status = 'Present';
        } else if (this.workingHours >= 4) {
            this.status = 'Half-day';
        }
    }
    next();
});

// Compound index for employee and date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
