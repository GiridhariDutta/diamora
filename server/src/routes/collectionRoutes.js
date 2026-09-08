import express from 'express';
import { CollectionController } from '../controllers/collectionController.js';

const router = express.Router();

// GET /api/collections - Get all collections
router.get('/', CollectionController.getAll);

// POST /api/collections - Create new collection
router.post('/', CollectionController.create);

// PUT /api/collections/reorder - Batch reorder collections
router.put('/reorder', CollectionController.reorder);

// PUT /api/collections/:id - Update collection
router.put('/:id', CollectionController.update);

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', CollectionController.delete);

export default router;
