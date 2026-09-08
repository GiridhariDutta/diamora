import express from 'express';
import { PurityController } from '../controllers/purityController.js';

const router = express.Router();

// GET /api/purities - Get all purities
router.get('/', PurityController.getAll);

// POST /api/purities - Create new purity
router.post('/', PurityController.create);

// PUT /api/purities/reorder - Batch reorder purities
router.put('/reorder', PurityController.reorder);

// PUT /api/purities/:id - Update purity
router.put('/:id', PurityController.update);

// DELETE /api/purities/:id - Delete purity
router.delete('/:id', PurityController.delete);

export default router;
