import express from 'express';
import { SettingTypeController } from '../controllers/settingTypeController.js';

const router = express.Router();

router.get('/', SettingTypeController.getAll);
router.get('/:id', SettingTypeController.getById);

router.post('/', SettingTypeController.create);
router.put('/:id', SettingTypeController.update);
router.delete('/:id', SettingTypeController.delete);

export default router;
