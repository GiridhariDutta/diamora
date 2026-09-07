import { AuthService } from '../services/authService.js';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      const result = await AuthService.registerUser({ name, email, password });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully!',
        data: result
      });
    } catch (error) {
      console.error('Error in AuthController.register:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Registration failed.'
      });
    }
  }

  /**
   * Login with email and password
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const result = await AuthService.loginUser({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        data: result
      });
    } catch (error) {
      console.error('Error in AuthController.login:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed.'
      });
    }
  }

  /**
   * Login/Register via Firebase Client Token (Google or Firebase Auth)
   */
  static async firebaseLogin(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: 'Firebase ID token is required.'
        });
      }

      const result = await AuthService.verifyFirebaseTokenAndLogin(idToken);

      return res.status(200).json({
        success: true,
        message: 'Authenticated successfully via Firebase!',
        data: result
      });
    } catch (error) {
      console.error('Error in AuthController.firebaseLogin:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Firebase token verification failed.'
      });
    }
  }

  /**
   * Get current authenticated user profile
   */
  static async getProfile(req, res) {
    try {
      const userProfile = await AuthService.getUserProfile(req.user.uid);
      const token = AuthService.generateJwtToken(userProfile);

      return res.status(200).json({
        success: true,
        data: userProfile,
        token
      });
    } catch (error) {
      console.error('Error in AuthController.getProfile:', error);
      return res.status(404).json({
        success: false,
        message: error.message || 'Profile not found.'
      });
    }
  }

  /**
   * Fetch all Admin Users with Firebase Auth metadata (lastSignInTime)
   */
  static async getAdminUsers(req, res) {
    try {
      const adminUsers = await AuthService.getAdminUsers();
      return res.status(200).json({
        success: true,
        data: adminUsers
      });
    } catch (error) {
      console.error('Error in AuthController.getAdminUsers:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch admin users.'
      });
    }
  }

  /**
   * Create a new Admin User (generates random 8-character password)
   */
  static async createAdminUser(req, res) {
    try {
      const { name, email } = req.body;

      const result = await AuthService.createAdminUser({ name, email });

      return res.status(201).json({
        success: true,
        message: 'Admin user created successfully!',
        data: result
      });
    } catch (error) {
      console.error('Error in AuthController.createAdminUser:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create admin user.'
      });
    }
  }

  /**
   * Update an Admin User (name, email)
   */
  static async updateAdminUser(req, res) {
    try {
      const { uid } = req.params;
      const { name, email } = req.body;

      const updatedUser = await AuthService.updateAdminUser(uid, { name, email });

      return res.status(200).json({
        success: true,
        message: 'Admin user updated successfully!',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error in AuthController.updateAdminUser:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update admin user.'
      });
    }
  }

  /**
   * Delete an Admin User from Firebase Auth & Firestore
   */
  static async deleteAdminUser(req, res) {
    try {
      const { uid } = req.params;

      const result = await AuthService.deleteAdminUser(uid);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in AuthController.deleteAdminUser:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete admin user.'
      });
    }
  }
}
