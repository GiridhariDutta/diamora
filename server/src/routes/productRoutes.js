import express from 'express';
import multer from 'multer';
import { ProductController } from '../controllers/productController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Upload product media (image or video) to Firebase Storage (authenticated)
router.post('/upload', authenticateToken, upload.single('file'), ProductController.uploadMedia);

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
