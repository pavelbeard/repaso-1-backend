import { Schema } from 'mongoose'

export interface ITodo {
  title: string
  description?: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)
