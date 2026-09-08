import { OrderService } from '../services/orderService.js';

export class OrderController {
  /**
   * GET /api/orders
   * Get all orders/inquiries
   */
  static async getAllOrders(req, res) {
    try {
      const orders = await OrderService.getAllOrders();
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
   * POST /api/orders
   * Create a new order/inquiry
   */
  static async createOrder(req, res) {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        notes,
        productId,
        productTitle,
        productSku,
        productPrice,
        productImage,
        selectedMetal,
        selectedColor,
        userId
      } = req.body;

      const newOrder = await OrderService.createOrder({
        customerName,
        customerPhone,
        customerEmail,
        notes,
        productId,
        productTitle,
        productSku,
        productPrice,
        productImage,
        selectedMetal,
        selectedColor,
        userId
      });

      return res.status(201).json({
        success: true,
        message: 'Inquiry submitted successfully',
        data: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit inquiry'
      });
    }
  }

  /**
   * PUT /api/orders/:id/status
   * Update order status (e.g. Mark as Viewed)
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
