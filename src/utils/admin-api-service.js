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

const fetchQuestion = async () => {
  const response = await API.get(`${API_ROUTES.ADMIN.GET_QUESTIONS}`)
  return response.data
}

const fetchAllJumbleOpt = async () => {
  const response = await API.get(API_ROUTES.ADMIN.GET_JUMBLE_WORDS)
  return response.data
}

const fetchAllBgImg = async () => {
  const response = await API.get(API_ROUTES.ADMIN.GET_BG_IMAGES)
  return response.data
}

const adminAddQuestion = async (body) => {
  const response = await API.post(`${API_ROUTES.ADMIN.ADD_QUESTION}`, body)
  return response.data
}

const adminAddJumbleWord = async (body) => {
  const response = await API.post(`${API_ROUTES.ADMIN.POST_JUMBLE_WORDS}`, body)
  return response.data
}

const adminAddBackgroundImages = async (body) => {
  const response = await API.post(`${API_ROUTES.ADMIN.POST_BG_IMAGES}`, body)
  return response.data
}

const adminUpdateJumbleWord = async ({ id, body }) => {
  const response = await API.patch(
    `${API_ROUTES.ADMIN.UPDATE_JUMBLE_WORDS?.replace(':id', id)}`,
    body,
  )
  return response.data
}

const updateAdminQuestion = async ({ questionId, body }) => {
  const response = await API.patch(
    `${API_ROUTES.ADMIN.UPDATE_QUESTION?.replace(':questionId', questionId)}`,
    body,
  )
  return response.data
}

const updateAdminProfile = async ({ adminId, body }) => {
  const response = await API.patch(
    `${API_ROUTES.ADMIN.UPDATE_PROFILE.replace(':adminId', adminId)}`,
    body,
  )

  return response.data
}

const updateUser = async ({ userId, userData }) => {
  const response = await API.patch(
    `${API_ROUTES.ADMIN.UPDATE_USER?.replace(':userId', userId)}`,
    userData,
  )
  return response.data
}

const deleteQuestionById = async (questionId) => {
  const response = await API.delete(
    `${API_ROUTES.ADMIN.DELETE_QUESTION?.replace(':questionId', questionId)}`,
  )
  return response.data
}

const deleteUserById = async (userId) => {
  const response = await API.delete(`${API_ROUTES.ADMIN.DELETE_USER?.replace(':userId', userId)}`)
  return response.data
}

const deleteWordById = async (jumbleId) => {
  const response = await API.delete(
    `${API_ROUTES.ADMIN.DELETE_JUMBLE_WORDS?.replace(':id', jumbleId)}`,
  )
  return response.data
}

export {
  fetchAllUser,
  fetchUserId,
  fetchAdminProfile,
  fetchQuestion,
  fetchAllJumbleOpt,
  fetchAllBgImg,
  adminAddQuestion,
  adminAddJumbleWord,
  adminAddBackgroundImages,
  updateUser,
  updateAdminProfile,
  updateAdminQuestion,
  adminUpdateJumbleWord,
  deleteUserById,
  deleteQuestionById,
  deleteWordById,
}
