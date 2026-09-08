import express from 'express';
import { OrderController } from '../controllers/orderController.js';

const router = express.Router();

// GET /api/orders - Get all orders/inquiries
router.get('/', OrderController.getAllOrders);

// POST /api/orders - Submit a new inquiry / order
router.post('/', OrderController.createOrder);

// PUT /api/orders/:id/status - Update order status (e.g., mark as viewed)
router.put('/:id/status', OrderController.updateOrderStatus);
router.put('/:id', OrderController.updateOrderStatus);

// DELETE /api/orders/:id - Delete inquiry / order
router.delete('/:id', OrderController.deleteOrder);

export default router;
