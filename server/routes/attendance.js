import express from 'express';
import {
    checkIn,
    checkOut,
    getMyAttendance,
    getAllAttendance,
    markAttendance,
    updateAttendance
} from '../controllers/attendanceController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/my', protect, getMyAttendance);
router.get('/all', protect, adminOnly, getAllAttendance);
router.post('/mark', protect, adminOnly, markAttendance);
router.put('/:id', protect, adminOnly, updateAttendance);

export default router;
