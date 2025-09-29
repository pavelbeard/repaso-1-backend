import {
  CreateUserInput,
  UpdateUserInput,
} from 'src/features/auth/auth.schemas'
import { User } from '../models/auth.models'

// CREATE
export const createUserQuery = async (
  data: Omit<CreateUserInput['body'], 'confirmPassword'>
) => {
  return await User.create(data)
}

// READ
export const findUserByIdOrUsernameOrEmailQuery = async ({
  id,
  username,
  email,
}: {
  id?: string
  username?: string
  email?: string
}) => {
  return await User.findOne({
    $or: [{ _id: id }, { username }, { email }],
  })
}

// UPDATE
export const updateUserQuery = async (
  id: string,
  data: UpdateUserInput['body']
) => {
  return await User.findByIdAndUpdate(id, data, { new: true })
}

// DELETE
export const deleteUserQuery = async (id: string) => {
  return await User.findByIdAndDelete(id)
}
