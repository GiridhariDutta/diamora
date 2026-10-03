import { ShapeService } from '../services/shapeService.js';

export class ShapeController {
  static async getAll(req, res) {
    try {
      const shapes = await ShapeService.getAllShapes();
      return res.status(200).json({ success: true, data: shapes });
    } catch (error) {
      console.error('Error in ShapeController.getAll:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch shapes' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const shape = await ShapeService.getShapeById(id);
      return res.status(200).json({ success: true, data: shape });
    } catch (error) {
      console.error('Error in ShapeController.getById:', error);
      return res.status(404).json({ success: false, message: error.message || 'Shape not found' });
    }
  }

  static async create(req, res) {
    try {
      const shape = await ShapeService.createShape(req.body);
      return res.status(201).json({ success: true, message: 'Shape created successfully', data: shape });
    } catch (error) {
      console.error('Error in ShapeController.create:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to create shape' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedShape = await ShapeService.updateShape(id, req.body);
      return res.status(200).json({ success: true, message: 'Shape updated successfully', data: updatedShape });
    } catch (error) {
      console.error('Error in ShapeController.update:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to update shape' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ShapeService.deleteShape(id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      console.error('Error in ShapeController.delete:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to delete shape' });
    }
  }
}
