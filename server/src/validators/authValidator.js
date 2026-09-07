import { z } from 'zod';

// Registration Validation Schema
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long')
});

// Login Validation Schema
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty')
});

// Firebase Token Login Validation Schema
export const firebaseLoginSchema = z.object({
  idToken: z
    .string({ required_error: 'Firebase ID token is required' })
    .min(1, 'ID token cannot be empty')
});

// Create Admin User Validation Schema
export const createAdminSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
});

// Update Admin User Validation Schema
export const updateAdminSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters')
    .optional(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
});

/**
 * Generic Express Middleware to validate request body using Zod schema
 */
export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues?.[0]?.message || 'Validation error';
      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: error.issues?.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        })) || []
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error during validation.'
    });
  }
};
