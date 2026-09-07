import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireAdminRole } from '../middlewares/adminMiddleware.js';
import { 
  validateBody, 
  registerSchema, 
  loginSchema, 
  firebaseLoginSchema,
  createAdminSchema,
  updateAdminSchema
} from '../validators/authValidator.js';

const router = express.Router();

// Public auth routes with Zod validation
router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/firebase-login', validateBody(firebaseLoginSchema), AuthController.firebaseLogin);

// Protected routes
router.get('/me', authenticateToken, AuthController.getProfile);

// Admin-only management routes with Zod validation & admin role guard
router.get('/admin-users', authenticateToken, requireAdminRole, AuthController.getAdminUsers);
router.post('/admin-users', authenticateToken, requireAdminRole, validateBody(createAdminSchema), AuthController.createAdminUser);
router.put('/admin-users/:uid', authenticateToken, requireAdminRole, validateBody(updateAdminSchema), AuthController.updateAdminUser);
router.delete('/admin-users/:uid', authenticateToken, requireAdminRole, AuthController.deleteAdminUser);

export default router;
