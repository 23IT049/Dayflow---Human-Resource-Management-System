import express from 'express';
import {
    getMyProfile,
    getEmployeeById,
    getAllEmployees,
    updateMyProfile,
    updateEmployee,
    deleteEmployee
} from '../controllers/employeeController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, updateMyProfile);
router.get('/', protect, adminOnly, getAllEmployees);
router.get('/:id', protect, adminOnly, getEmployeeById);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

export default router;
