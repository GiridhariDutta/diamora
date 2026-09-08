import { SettingsService } from '../services/settingsService.js';

export class SettingsController {
  /**
   * Get setting document by key
   */
  static async getByKey(req, res) {
    try {
      const { key } = req.params;
      const setting = await SettingsService.getSetting(key);
      return res.status(200).json({
        success: true,
        data: setting
      });
    } catch (error) {
      console.error('Error in SettingsController.getByKey:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch setting.'
      });
    }
  }

  /**
   * Update setting document by key
   */
  static async updateByKey(req, res) {
    try {
      const { key } = req.params;
      const { title, content } = req.body;

      const updatedSetting = await SettingsService.saveSetting(key, { title, content });
      return res.status(200).json({
        success: true,
        message: 'Setting saved successfully!',
        data: updatedSetting
      });
    } catch (error) {
      console.error('Error in SettingsController.updateByKey:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update setting.'
      });
    }
  }
}
