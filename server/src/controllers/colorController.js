import { ColorService } from '../services/colorService.js';

export class ColorController {
  /**
   * Get all colors
   */
  static async getAll(req, res) {
    try {
      const colors = await ColorService.getAllColors();
      return res.status(200).json({
        success: true,
        data: colors
      });
    } catch (error) {
      console.error('Error in ColorController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch colors.'
      });
    }
  }

  /**
   * Create a new color
   */
  static async create(req, res) {
    try {
      const { title, order, status } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Color title is required.'
        });
      }

      const color = await ColorService.createColor({
        title,
        order,
        status
      });

      return res.status(201).json({
        success: true,
        message: 'Color created successfully!',
        data: color
      });
    } catch (error) {
      console.error('Error in ColorController.create:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create color.'
      });
    }
  }

  /**
   * Update color
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, order, status } = req.body;

      const updatedColor = await ColorService.updateColor(id, {
        title,
        order,
        status
      });

      return res.status(200).json({
        success: true,
        message: 'Color updated successfully!',
        data: updatedColor
      });
    } catch (error) {
      console.error('Error in ColorController.update:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update color.'
      });
    }
  }

  /**
   * Delete color
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await ColorService.deleteColor(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in ColorController.delete:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete color.'
      });
    }
  }

  /**
   * Batch reorder colors
   */
  static async reorder(req, res) {
    try {
      const { orderedItems } = req.body;

      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({
          success: false,
          message: 'orderedItems must be an array of color items.'
        });
      }

      const result = await ColorService.reorderColors(orderedItems);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in ColorController.reorder:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reorder colors.'
      });
    }
  }
}
