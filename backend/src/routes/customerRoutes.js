import express from 'express';
import { getCustomers, getDashboardStats } from '../controllers/customerController.js';

const router = express.Router();

router.get('/customers', getCustomers);
router.get('/admin/dashboard', getDashboardStats);

export default router;

