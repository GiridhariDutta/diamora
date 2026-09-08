import { ProductService } from '../services/productService.js';

export class ProductController {
  static async getAll(req, res) {
    try {
      const products = await ProductService.getAllProducts();
      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error in ProductController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch products.'
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error in ProductController.getById:', error);
      return res.status(404).json({
        success: false,
        message: error.message || 'Product not found.'
      });
    }
  }

  static async create(req, res) {
    try {
      const product = await ProductService.createProduct(req.body);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully!',
        data: product
      });
    } catch (error) {
      console.error('Error in ProductController.create:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create product.'
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedProduct = await ProductService.updateProduct(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Product updated successfully!',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error in ProductController.update:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update product.'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in ProductController.delete:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete product.'
      });
    }
  }
}
