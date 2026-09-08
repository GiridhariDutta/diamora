import { DiamondQualityService } from '../services/diamondQualityService.js';

export class DiamondQualityController {
  static async getAll(req, res) {
    try {
      const items = await DiamondQualityService.getAllQualities();
      return res.status(200).json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Error in DiamondQualityController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch diamond qualities.'
      });
    }
  }

  static async create(req, res) {
    try {
      const { title, ratePerCarat, order, status } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required for diamond quality.'
        });
      }

      const item = await DiamondQualityService.createQuality({
        title,
        ratePerCarat,
        order,
        status
      });

      return res.status(201).json({
        success: true,
        message: 'Diamond quality created successfully!',
        data: item
      });
    } catch (error) {
      console.error('Error in DiamondQualityController.create:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create diamond quality.'
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, ratePerCarat, order, status } = req.body;

      const updated = await DiamondQualityService.updateQuality(id, {
        title,
        ratePerCarat,
        order,
        status
      });

      return res.status(200).json({
        success: true,
        message: 'Diamond quality updated successfully!',
        data: updated
      });
    } catch (error) {
      console.error('Error in DiamondQualityController.update:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update diamond quality.'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await DiamondQualityService.deleteQuality(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in DiamondQualityController.delete:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete diamond quality.'
      });
    }
  }

  static async reorder(req, res) {
    try {
      const { orderedItems } = req.body;

      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({
          success: false,
          message: 'orderedItems must be an array.'
        });
      }

      const result = await DiamondQualityService.reorderQualities(orderedItems);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in DiamondQualityController.reorder:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reorder diamond qualities.'
      });
    }
  }
}
