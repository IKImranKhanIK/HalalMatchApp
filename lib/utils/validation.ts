/**
 * Validation Schemas
 * Zod schemas for validating API inputs and forms
 */

import { z } from 'zod';

/**
 * Participant registration schema
 */
export const participantRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  gender: z.enum(['male', 'female'], {
    message: 'Gender must be male or female',
  }),
  age: z.number().int().min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
  occupation: z.string().min(2, 'Occupation must be at least 2 characters').max(100),
  participant_number: z.number().int().positive('Participant number must be a positive number'),
  event_id: z.string().uuid().optional(),
});

export type ParticipantRegistrationInput = z.infer<typeof participantRegistrationSchema>;

/**
 * Admin login schema
 */
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/**
 * Participant login schema (by number)
 */
export const participantLoginSchema = z.object({
  participant_number: z.number().int().positive('Invalid participant number'),
});

export type ParticipantLoginInput = z.infer<typeof participantLoginSchema>;

/**
 * Interest selection schema
 */
export const interestSelectionSchema = z.object({
  selector_id: z.string().uuid('Invalid selector ID'),
  selected_id: z.string().uuid('Invalid selected ID'),
});

export type InterestSelectionInput = z.infer<typeof interestSelectionSchema>;

/**
 * Update participant schema
 */
export const updateParticipantSchema = z.object({
  full_name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20).optional(),
  gender: z.enum(['male', 'female'], {
    message: 'Gender must be male or female',
  }).optional(),
  age: z.number().int().min(18).max(120).optional(),
  occupation: z.string().min(2).max(100).optional(),
  background_check_status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;

/**
 * Validate and parse data with a schema
 * @param schema Zod schema
 * @param data Data to validate
 * @returns Parsed data or validation errors
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format Zod errors for API responses
 * @param error Zod error
 * @returns Formatted error object
 */
export function formatZodError(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });

  return formatted;
}
