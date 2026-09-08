import express from 'express';
import { SettingsController } from '../controllers/settingsController.js';

const router = express.Router();

// GET /api/settings/:key - Get setting by key
router.get('/:key', SettingsController.getByKey);

// PUT /api/settings/:key - Save/update setting by key
router.put('/:key', SettingsController.updateByKey);

export default router;
