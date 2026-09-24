import express from 'express';
import { 
  createOrder, 
  getActiveOrder, 
  getAllOrders, 
  updateOrderStatus, 
  assignRider 
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/active', getActiveOrder);
router.get('/all', getAllOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/assign-rider', assignRider);

export default router;
