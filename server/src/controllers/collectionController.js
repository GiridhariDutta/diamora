import { CollectionService } from '../services/collectionService.js';

export class CollectionController {
  /**
   * Get all collections
   */
  static async getAll(req, res) {
    try {
      const collections = await CollectionService.getAllCollections();
      return res.status(200).json({
        success: true,
        data: collections
      });
    } catch (error) {
      console.error('Error in CollectionController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch collections.'
      });
    }
  }

  /**
   * Create a new collection
   */
  static async create(req, res) {
    try {
      const { title, heading, order, status } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Collection title is required.'
        });
      }

      const collection = await CollectionService.createCollection({
        title,
        heading,
        order,
        status
      });

      return res.status(201).json({
        success: true,
        message: 'Collection created successfully!',
        data: collection
      });
    } catch (error) {
      console.error('Error in CollectionController.create:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create collection.'
      });
    }
  }

  /**
   * Update collection
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, heading, order, status } = req.body;

      const updatedCollection = await CollectionService.updateCollection(id, {
        title,
        heading,
        order,
        status
      });

      return res.status(200).json({
        success: true,
        message: 'Collection updated successfully!',
        data: updatedCollection
      });
    } catch (error) {
      console.error('Error in CollectionController.update:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update collection.'
      });
    }
  }

  /**
   * Delete collection
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await CollectionService.deleteCollection(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in CollectionController.delete:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete collection.'
      });
    }
  }

  /**
   * Batch reorder collections
   */
  static async reorder(req, res) {
    try {
      const { orderedItems } = req.body;

      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({
          success: false,
          message: 'orderedItems must be an array of collection items.'
        });
      }

      const result = await CollectionService.reorderCollections(orderedItems);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in CollectionController.reorder:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reorder collections.'
      });
    }
  }
}
