import express from 'express';
import { DiamondQualityController } from '../controllers/diamondQualityController.js';

const router = express.Router();

router.get('/', DiamondQualityController.getAll);
router.post('/', DiamondQualityController.create);
router.put('/reorder', DiamondQualityController.reorder);
router.put('/:id', DiamondQualityController.update);
router.delete('/:id', DiamondQualityController.delete);

export default router;
