import express from 'express';
import { StoneController } from '../controllers/stoneController.js';

const router = express.Router();

// GET /api/stones - Get all gemstones
router.get('/', StoneController.getAll);

// POST /api/stones - Create new gemstone
router.post('/', StoneController.create);

// PUT /api/stones/reorder - Batch reorder gemstones
router.put('/reorder', StoneController.reorder);

// PUT /api/stones/:id - Update gemstone
router.put('/:id', StoneController.update);

// DELETE /api/stones/:id - Delete gemstone
router.delete('/:id', StoneController.delete);

export default router;
