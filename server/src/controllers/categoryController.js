import { CategoryService } from '../services/categoryService.js';

export class CategoryController {
  /**
   * Get all categories
   */
  static async getAll(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();
      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error in CategoryController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch categories.'
      });
    }
  }

  /**
   * Create a new category
   */
  static async create(req, res) {
    try {
      const { title, heading, order, status, imageUrl } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Category title is required.'
        });
      }

      const category = await CategoryService.createCategory({
        title,
        heading,
        order,
        status,
        imageUrl
      });

      return res.status(201).json({
        success: true,
        message: 'Category created successfully!',
        data: category
      });
    } catch (error) {
      console.error('Error in CategoryController.create:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create category.'
      });
    }
  }

  /**
   * Update category
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, heading, order, status, imageUrl } = req.body;

      const updatedCategory = await CategoryService.updateCategory(id, {
        title,
        heading,
        order,
        status,
        imageUrl
      });

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully!',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Error in CategoryController.update:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update category.'
      });
    }
  }

  /**
   * Delete category
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await CategoryService.deleteCategory(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in CategoryController.delete:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete category.'
      });
    }
  }

  /**
   * Batch reorder categories
   */
  static async reorder(req, res) {
    try {
      const { orderedItems } = req.body;

      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({
          success: false,
          message: 'orderedItems must be an array of category items.'
        });
      }

      const result = await CategoryService.reorderCategories(orderedItems);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in CategoryController.reorder:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reorder categories.'
      });
    }
  }

  /**
   * Upload image to Firebase Storage
   */
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded.'
        });
      }

      const uploadResult = await CategoryService.uploadCategoryImage(req.file);
      return res.status(200).json({
        success: true,
        message: 'Image uploaded to Firebase Storage successfully!',
        data: uploadResult
      });
    } catch (error) {
      console.error('Error in CategoryController.uploadImage:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image to Firebase Storage.'
      });
    }
  }
}
