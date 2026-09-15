import express from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/orders - Get all orders (supports optional ?userId= filter)
router.get('/', OrderController.getAllOrders);

// POST /api/orders/create-razorpay-order - Verify server prices & create Razorpay order
router.post('/create-razorpay-order', authenticateToken, OrderController.createRazorpayOrder);

// POST /api/orders/verify-razorpay-payment - Verify signature & save order
router.post('/verify-razorpay-payment', authenticateToken, OrderController.verifyRazorpayPayment);

// POST /api/orders - Submit a new inquiry / order
router.post('/', OrderController.createOrder);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', OrderController.updateOrderStatus);
router.put('/:id', OrderController.updateOrderStatus);

// DELETE /api/orders/:id - Delete inquiry / order
router.delete('/:id', OrderController.deleteOrder);

export default router;

