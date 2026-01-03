import express from 'express';
import {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getLeaveBalance
} from '../controllers/leaveController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', protect, applyLeave);
router.get('/my', protect, getMyLeaves);
router.get('/balance', protect, getLeaveBalance);
router.get('/all', protect, adminOnly, getAllLeaves);
router.put('/:id/approve', protect, adminOnly, approveLeave);
router.put('/:id/reject', protect, adminOnly, rejectLeave);
router.delete('/:id', protect, cancelLeave);

export default router;
