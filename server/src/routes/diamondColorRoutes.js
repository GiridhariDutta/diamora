import express from 'express';
import { DiamondColorController } from '../controllers/diamondColorController.js';

const router = express.Router();

// GET /api/diamond-colors - Get all diamond colors
router.get('/', DiamondColorController.getAll);

// POST /api/diamond-colors - Create new diamond color
router.post('/', DiamondColorController.create);

// PUT /api/diamond-colors/reorder - Batch reorder diamond colors
router.put('/reorder', DiamondColorController.reorder);

// PUT /api/diamond-colors/:id - Update diamond color
router.put('/:id', DiamondColorController.update);

// DELETE /api/diamond-colors/:id - Delete diamond color
router.delete('/:id', DiamondColorController.delete);

export default router;
