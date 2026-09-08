import express from 'express';
import { ColorController } from '../controllers/colorController.js';

const router = express.Router();

// GET /api/colors - Get all colors
router.get('/', ColorController.getAll);

// POST /api/colors - Create new color
router.post('/', ColorController.create);

// PUT /api/colors/reorder - Batch reorder colors
router.put('/reorder', ColorController.reorder);

// PUT /api/colors/:id - Update color
router.put('/:id', ColorController.update);

// DELETE /api/colors/:id - Delete color
router.delete('/:id', ColorController.delete);

export default router;
