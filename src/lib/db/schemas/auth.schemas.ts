import { Schema } from 'mongoose'

export interface IUser {
  username: string
  password: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export interface IRefreshTokenBlacklist {
  token: string
  createdAt: Date
}

export const RefreshTokenBlacklistSchema = new Schema<IRefreshTokenBlacklist>(
  {
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)
