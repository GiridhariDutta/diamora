import { StoneService } from '../services/stoneService.js';

export class StoneController {
  /**
   * Get all gemstones
   */
  static async getAll(req, res) {
    try {
      const stones = await StoneService.getAllStones();
      return res.status(200).json({
        success: true,
        data: stones
      });
    } catch (error) {
      console.error('Error in StoneController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch gemstones.'
      });
    }
  }

  /**
   * Create a new gemstone
   */
  static async create(req, res) {
    try {
      const { title, order, status, ratePerCarat } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Stone title is required.'
        });
      }

      const stone = await StoneService.createStone({
        title,
        order,
        status,
        ratePerCarat
      });

      return res.status(201).json({
        success: true,
        message: 'Gemstone created successfully!',
        data: stone
      });
    } catch (error) {
      console.error('Error in StoneController.create:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create gemstone.'
      });
    }
  }

  /**
   * Update gemstone
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, order, status, ratePerCarat } = req.body;

      const updatedStone = await StoneService.updateStone(id, {
        title,
        order,
        status,
        ratePerCarat
      });

      return res.status(200).json({
        success: true,
        message: 'Gemstone updated successfully!',
        data: updatedStone
      });
    } catch (error) {
      console.error('Error in StoneController.update:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update gemstone.'
      });
    }
  }

  /**
   * Delete gemstone
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await StoneService.deleteStone(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in StoneController.delete:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete gemstone.'
      });
    }
  }

  /**
   * Batch reorder gemstones
   */
  static async reorder(req, res) {
    try {
      const { orderedItems } = req.body;

      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({
          success: false,
          message: 'orderedItems must be an array of gemstone items.'
        });
      }

      const result = await StoneService.reorderStones(orderedItems);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in StoneController.reorder:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reorder gemstones.'
      });
    }
  }
}
