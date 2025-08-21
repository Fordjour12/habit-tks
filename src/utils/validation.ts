import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters'),
});

export const updateUserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.boolean().optional(),
  strictMode: z.boolean().optional(),
  autoProgression: z.boolean().optional(),
});

export const updateUserTierSchema = z.object({
  tier: z.enum(['baseline', 'tier2', 'tier3']),
});

// Habit validation schemas
export const createHabitSchema = z.object({
  name: z.string()
    .min(3, 'Habit name must be at least 3 characters')
    .max(100, 'Habit name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  category: z.enum(['fitness', 'work', 'learning', 'productivity', 'health', 'social']),
  tier: z.enum(['baseline', 'tier2', 'tier3']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  reminderTime: z.string().optional(),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  streakTracking: z.boolean(),
  skipAllowed: z.boolean(),
  startDate: z.string().datetime('Please enter a valid start date'),
});

export const completeHabitSchema = z.object({
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
  metrics: z.object({
    duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
    intensity: z.enum(['low', 'medium', 'high']).optional(),
    additionalData: z.record(z.string(), z.any()).optional(),
  }).optional(),
});

export const skipHabitSchema = z.object({
  reason: z.string()
    .min(5, 'Please provide a reason for skipping (at least 5 characters)')
    .max(200, 'Reason must be less than 200 characters'),
});

// Setup validation schemas
export const setupAccountSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Generic validation function
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      (error as any).errors.forEach((err: any) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Field-specific validation
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown, fieldName: string): string | null => {
  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = (error as any).errors.find((err: any) => err.path.includes(fieldName));
      return fieldError ? fieldError.message : null;
    }
    return 'Validation failed';
  }
};

// Export types
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserSettingsData = z.infer<typeof updateUserSettingsSchema>;
export type UpdateUserTierData = z.infer<typeof updateUserTierSchema>;
export type CreateHabitData = z.infer<typeof createHabitSchema>;
export type CompleteHabitData = z.infer<typeof completeHabitSchema>;
export type SkipHabitData = z.infer<typeof skipHabitSchema>;
export type SetupAccountData = z.infer<typeof setupAccountSchema>;
