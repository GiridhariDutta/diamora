import { OrderService } from '../services/orderService.js';

export class OrderController {
  /**
   * GET /api/orders
   * Get all orders (supports optional ?userId= filter)
   */
  static async getAllOrders(req, res) {
    try {
      const { userId } = req.query;
      const orders = await OrderService.getAllOrders(userId);
      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch orders'
      });
    }
  }

  /**
   * POST /api/orders/create-razorpay-order
   * Create Razorpay order with server price & profile verification
   */
  static async createRazorpayOrder(req, res) {
    try {
      const { items, shippingDetails, totalAmount, userId } = req.body;
      const activeUserId = req.user?.uid || userId;

      const result = await OrderService.createRazorpayOrder({
        items,
        shippingDetails,
        totalAmount,
        userId: activeUserId
      });

      return res.status(200).json({
        success: true,
        message: 'Razorpay order created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in createRazorpayOrder:', error);
      const errMsg = error.description || error.error?.description || error.message || 'Razorpay order creation failed.';
      return res.status(400).json({
        success: false,
        message: errMsg
      });
    }
  }

  /**
   * POST /api/orders/verify-razorpay-payment
   * Verify Razorpay payment signature & save paid order to database
   */
  static async verifyRazorpayPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, shippingDetails, totalAmount, userId } = req.body;
      const activeUserId = req.user?.uid || userId;

      const savedOrder = await OrderService.verifyRazorpayPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        items,
        shippingDetails,
        totalAmount,
        userId: activeUserId
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified and order saved successfully!',
        data: savedOrder
      });
    } catch (error) {
      console.error('Error in verifyRazorpayPayment:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Payment verification failed.'
      });
    }
  }

  /**
   * POST /api/orders
   * Create a new order/inquiry
   */
  static async createOrder(req, res) {
    try {
      const newOrder = await OrderService.createOrder(req.body);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to place order'
      });
    }
  }

  /**
   * PUT /api/orders/:id/status
   * Update order status
   */
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedOrder = await OrderService.updateOrderStatus(id, { status });

      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order status'
      });
    }
  }

  /**
   * DELETE /api/orders/:id
   * Delete order/inquiry
   */
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const result = await OrderService.deleteOrder(id);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete order'
      });
    }
  }
}

