import { SettingTypeService } from '../services/settingTypeService.js';

export class SettingTypeController {
  static async getAll(req, res) {
    try {
      const settingTypes = await SettingTypeService.getAllSettingTypes();
      return res.status(200).json({ success: true, data: settingTypes });
    } catch (error) {
      console.error('Error in SettingTypeController.getAll:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch setting types' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const settingType = await SettingTypeService.getSettingTypeById(id);
      return res.status(200).json({ success: true, data: settingType });
    } catch (error) {
      console.error('Error in SettingTypeController.getById:', error);
      return res.status(404).json({ success: false, message: error.message || 'Setting Type not found' });
    }
  }

  static async create(req, res) {
    try {
      const settingType = await SettingTypeService.createSettingType(req.body);
      return res.status(201).json({ success: true, message: 'Setting Type created successfully', data: settingType });
    } catch (error) {
      console.error('Error in SettingTypeController.create:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to create setting type' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedSettingType = await SettingTypeService.updateSettingType(id, req.body);
      return res.status(200).json({ success: true, message: 'Setting Type updated successfully', data: updatedSettingType });
    } catch (error) {
      console.error('Error in SettingTypeController.update:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to update setting type' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await SettingTypeService.deleteSettingType(id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      console.error('Error in SettingTypeController.delete:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to delete setting type' });
    }
  }
}
