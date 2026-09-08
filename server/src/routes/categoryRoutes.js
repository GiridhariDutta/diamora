import express from 'express';
import multer from 'multer';
import { CategoryController } from '../controllers/categoryController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Multer memory storage configuration for Firebase Storage uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET all categories (public/authenticated)
router.get('/', CategoryController.getAll);

// Upload category image to Firebase Storage (authenticated)
router.post('/upload', authenticateToken, upload.single('image'), CategoryController.uploadImage);

// Create category (authenticated)
router.post('/', authenticateToken, CategoryController.create);

// Batch reorder categories (authenticated)
router.put('/reorder', authenticateToken, CategoryController.reorder);

// Update category (authenticated)
router.put('/:id', authenticateToken, CategoryController.update);

// Delete category (authenticated)
router.delete('/:id', authenticateToken, CategoryController.delete);

export default router;
