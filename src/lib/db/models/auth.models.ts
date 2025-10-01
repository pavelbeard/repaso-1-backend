import mongoose from 'mongoose'
import {
  RefreshTokenBlacklistSchema,
  UserSchema,
} from '../schemas/auth.schemas'

export const User = mongoose.model('User', UserSchema)
export const RefreshTokenBlacklist = mongoose.model(
  'RefreshTokenBlacklist',
  RefreshTokenBlacklistSchema
)
