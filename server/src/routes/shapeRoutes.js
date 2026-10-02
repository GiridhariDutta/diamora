import express from 'express';
import { ShapeController } from '../controllers/shapeController.js';

const router = express.Router();

// Public routes (if you want customers to fetch shapes, for example in filters)
router.get('/', ShapeController.getAll);
router.get('/:id', ShapeController.getById);



router.post('/', ShapeController.create);
router.put('/:id', ShapeController.update);
router.delete('/:id', ShapeController.delete);

export default router;
