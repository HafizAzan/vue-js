import { API_ROUTES } from '@/router/apiRoutes'
import API from './axios'

const fetchAllUser = async ({ page = '1' }) => {
  const response = await API.get(`${API_ROUTES.ADMIN.GET_USERS_LIST}?page=${page}`)
  return response.data
}

const fetchUserId = async (userId) => {
  const response = await API.get(`${API_ROUTES.ADMIN.GET_SINGLE_USER?.replace(':userId', userId)}`)
  return response.data
}

const fetchAdminProfile = async () => {
  const response = await API.get(`${API_ROUTES.ADMIN.PROFILE}`)
  return response.data
}

const updateUser = async ({ userId, userData }) => {
  const response = await API.patch(
    `${API_ROUTES.ADMIN.UPDATE_USER?.replace(':userId', userId)}`,
    userData,
  )
  return response.data
}

const deleteUserById = async (userId) => {
  const response = await API.delete(`${API_ROUTES.ADMIN.DELETE_USER?.replace(':userId', userId)}`)
  return response.data
}

export { fetchAllUser, fetchUserId, updateUser, deleteUserById, fetchAdminProfile }
