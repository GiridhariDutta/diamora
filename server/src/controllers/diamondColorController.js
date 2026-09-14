import { DiamondColorService } from '../services/diamondColorService.js';

export class DiamondColorController {
  /**
   * Get all diamond colors
   */
  static async getAll(req, res) {
    try {
      const colors = await DiamondColorService.getAllDiamondColors();
      return res.status(200).json({
        success: true,
        data: colors
      });
    } catch (error) {
      console.error('Error in DiamondColorController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch diamond colors.'
      });
    }
  }

  /**
   * Create a new diamond color
   */
  static async create(req, res) {
    try {
      const { title, order, status } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Diamond color title is required.'
        });
      }

      const color = await DiamondColorService.createDiamondColor({
        title,
        order,
        status
      });

      return res.status(201).json({
        success: true,
        message: 'Diamond color created successfully!',
        data: color
      });
    } catch (error) {
      console.error('Error in DiamondColorController.create:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create diamond color.'
      });
    }
  }

  /**
   * Update diamond color
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, order, status } = req.body;

      const updatedColor = await DiamondColorService.updateDiamondColor(id, {
        title,
        order,
        status
      });

      return res.status(200).json({
        success: true,
        message: 'Diamond color updated successfully!',
        data: updatedColor
      });
    } catch (error) {
      console.error('Error in DiamondColorController.update:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update diamond color.'
      });
    }
  }

  /**
   * Delete diamond color
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await DiamondColorService.deleteDiamondColor(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in DiamondColorController.delete:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete diamond color.'
      });
    }
  }

  /**
   * Batch reorder diamond colors
   */
  static async reorder(req, res) {
    try {
      const { orderedItems } = req.body;

      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({
          success: false,
          message: 'orderedItems must be an array of diamond color items.'
        });
      }

      const result = await DiamondColorService.reorderDiamondColors(orderedItems);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in DiamondColorController.reorder:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reorder diamond colors.'
      });
    }
  }
}
