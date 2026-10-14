import { ProductService } from '../services/productService.js';
import { StorageService } from '../services/storageService.js';

/**
 * Formats database, grpc, and validation errors into user-friendly messages
 */
function formatProductErrorMessage(error, defaultMsg = 'An unexpected error occurred while processing the product.') {
  if (!error) return defaultMsg;
  const rawMsg = error.message || String(error);

  // 1. Firestore Document Size Limit (1,048,576 bytes / 1MB limit)
  if (
    rawMsg.includes('1,048,576') || 
    rawMsg.includes('exceeds the maximum allowed size') || 
    rawMsg.includes('cannot be written because its size')
  ) {
    return 'Product data size exceeds the 1MB document limit. Please ensure description does not contain pasted images and upload photos only through the Media upload section.';
  }

  // 2. Custom validation messages from ProductService
  if (
    rawMsg.includes('Product title is required') ||
    rawMsg.includes('Product description is too long') ||
    rawMsg.includes('Images cannot be pasted into the description') ||
    rawMsg.includes('Base64 images are not allowed') ||
    rawMsg.includes('Product not found')
  ) {
    return rawMsg;
  }

  // 3. Firestore connection / network / quota errors
  if (rawMsg.includes('DEADLINE_EXCEEDED') || rawMsg.includes('ETIMEDOUT') || rawMsg.includes('ESOCKETTIMEDOUT')) {
    return 'Database connection timed out. Please check your network connection and try again.';
  }

  if (rawMsg.includes('UNAVAILABLE') || rawMsg.includes('service is currently unavailable')) {
    return 'Database service is temporarily unavailable. Please try again in a few moments.';
  }

  if (rawMsg.includes('PERMISSION_DENIED') || rawMsg.includes('Missing or insufficient permissions')) {
    return 'Database permission error. Please verify your admin credentials and try again.';
  }

  if (rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return 'Database request limit reached. Please wait a few moments and try again.';
  }

  // 4. Request entity too large (HTTP 413)
  if (rawMsg.includes('entity too large') || rawMsg.includes('PayloadTooLargeError')) {
    return 'The submitted product payload is too large. Please reduce image sizes and try again.';
  }

  // 5. Clean, human-readable errors that don't expose internal paths or gRPC codes
  if (
    !rawMsg.includes('projects/') && 
    !rawMsg.includes('databases/') && 
    !rawMsg.includes('INVALID_ARGUMENT') && 
    !rawMsg.includes('at ') &&
    rawMsg.length < 140
  ) {
    return rawMsg;
  }

  return defaultMsg;
}

export class ProductController {
  static async getAll(req, res) {
    try {
      const { page, limit, search, category, collection, color, diamondColor, purity, price, showInCarousel, showInHomepage } = req.query;
      const result = await ProductService.getAllProducts({ page, limit, search, category, collection, color, diamondColor, purity, price, showInCarousel, showInHomepage });
      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in ProductController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: formatProductErrorMessage(error, 'Failed to fetch products.')
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
        message: formatProductErrorMessage(error, 'Product not found.')
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
        message: formatProductErrorMessage(error, 'Failed to create product.')
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
        message: formatProductErrorMessage(error, 'Failed to update product.')
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
        message: formatProductErrorMessage(error, 'Failed to delete product.')
      });
    }
  }

  /**
   * Upload product media (image or video) directly to Firebase Storage bucket
   */
  static async uploadMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No media file uploaded.'
        });
      }

      const result = await StorageService.uploadProductMedia(req.file);
      return res.status(200).json({
        success: true,
        message: 'Product media uploaded successfully.',
        data: result
      });
    } catch (error) {
      console.error('Error in ProductController.uploadMedia:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload product media.'
      });
    }
  }
}

