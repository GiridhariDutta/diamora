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

// Address Item Schema
export const addressSchema = z.object({
  id: z.string().max(100).optional(),
  _id: z.string().max(100).optional(),
  name: z
    .string()
    .min(1, 'Recipient name is required')
    .max(100, 'Recipient name must not exceed 100 characters'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  altPhone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Alternative phone number must be exactly 10 digits')
    .or(z.literal(''))
    .optional(),
  address: z
    .string()
    .min(1, 'Street address is required')
    .max(100, 'Street address must not exceed 100 characters'),
  landmark: z
    .string()
    .max(100, 'Landmark must not exceed 100 characters')
    .optional(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must not exceed 100 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State must not exceed 100 characters'),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),
  isDefault: z.boolean().optional()
});

// Profile Update Validation Schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .or(z.literal(''))
    .optional(),
  aadhaar: z
    .string()
    .regex(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits')
    .or(z.literal(''))
    .optional(),
  address: z.string().max(100, 'Address must not exceed 100 characters').optional(),
  landmark: z.string().max(100, 'Landmark must not exceed 100 characters').optional(),
  city: z.string().max(100, 'City must not exceed 100 characters').optional(),
  state: z.string().max(100, 'State must not exceed 100 characters').optional(),
  pincode: z.string().max(10, 'Pincode must not exceed 10 characters').optional(),
  addresses: z
    .array(addressSchema)
    .max(10, 'You cannot save more than 10 shipping addresses')
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

