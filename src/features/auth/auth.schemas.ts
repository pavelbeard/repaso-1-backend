import { z } from 'zod'

// VALIDATION SCHEMAS FOR AUTH FEATURE
/** GENERIC AUTH SCHEMAS */

const userSchema = z.object({
  id: z.uuid(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

/** CREATE as REGISTER */
export const createUserSchema = z.object({
  body: userSchema
    .omit({ id: true, createdAt: true, updatedAt: true })
    .extend({
      confirmPassword: z.string().min(8).max(100),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
})

/** READ */
export const readUserSchema = z.object({
  params: userSchema.pick({
    id: true,
    username: true,
    email: true,
  }),
})

/** UPDATE */
export const updateUserSchema = z.object({
  params: userSchema.pick({ id: true }),
  body: userSchema
    .partial()
    .omit({ id: true, createdAt: true, updatedAt: true }),
})

/** DELETE */
export const deleteUserSchema = z.object({
  params: userSchema.pick({ id: true }),
})

/** LOGIN */
export const loginSchema = z.object({
  body: z.object({
    email: userSchema.shape.email,
    password: userSchema.shape.password,
  }),
})

/** EXPORT TYPES */
export type CreateUserInput = z.infer<typeof createUserSchema>
export type ReadUserOutput = z.infer<typeof readUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type DeleteUserInput = z.infer<typeof deleteUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
