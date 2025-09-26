import mongoose from 'mongoose'
import { UserSchema } from '../schemas/auth.schemas'

export const User = mongoose.model('User', UserSchema)
