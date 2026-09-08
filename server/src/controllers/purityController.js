import { PurityService } from '../services/purityService.js';

export class PurityController {
  /**
   * Get all purities
   */
  static async getAll(req, res) {
    try {
      const purities = await PurityService.getAllPurities();
      return res.status(200).json({
        success: true,
        data: purities
      });
    } catch (error) {
      console.error('Error in PurityController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch purities.'
      });
    }
  }

  /**
   * Create a new purity
   */
  static async create(req, res) {
    try {
      const { title, order, status, ratePerGram } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Purity title is required.'
        });
      }

      const purity = await PurityService.createPurity({
        title,
        order,
        status,
        ratePerGram
      });

      return res.status(201).json({
        success: true,
        message: 'Purity created successfully!',
        data: purity
      });
    } catch (error) {
      console.error('Error in PurityController.create:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create purity.'
      });
    }
  }

  /**
   * Update purity
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, order, status, ratePerGram } = req.body;

      const updatedPurity = await PurityService.updatePurity(id, {
        title,
        order,
        status,
        ratePerGram
      });

      return res.status(200).json({
        success: true,
        message: 'Purity updated successfully!',
        data: updatedPurity
      });
    } catch (error) {
      console.error('Error in PurityController.update:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update purity.'
      });
    }
  }

  /**
   * Delete purity
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await PurityService.deletePurity(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in PurityController.delete:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete purity.'
      });
    }
  }

  /**
   * Batch reorder purities
   */
  static async reorder(req, res) {
    try {
      const { orderedItems } = req.body;

      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({
          success: false,
          message: 'orderedItems must be an array of purity items.'
        });
      }

      const result = await PurityService.reorderPurities(orderedItems);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in PurityController.reorder:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reorder purities.'
      });
    }
  }
}
