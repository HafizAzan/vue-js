import { API_ROUTES } from '@/router/apiRoutes'
import API from './axios'

// fetch data service
const fetchLeaderBoardData = async ({ page = '1', userId = '123' }) => {
  const response = await API.get(`${API_ROUTES.PLAY}?page=${page}&loggedInUserId=${userId}`)
  return response.data
}

const fetchLeaderBoardDataByLevel = async ({ page = '1', level = '1' }) => {
  const response = await API.get(`${API_ROUTES.FILTER_LEVEL.replace(':level', level)}?page=${page}`)
  return response.data
}

const fetchQuestions = async () => {
  const response = await API.get(API_ROUTES.GET_QUESTION)
  return response?.data
}

const fetchAllValues = async () => {
  const response = await API.get(API_ROUTES.VALUES)
  return response.data
}

const fetchAllUsers = async () => {
  const response = await API.get(API_ROUTES.GET_ALL_USERS)
  return response.data
}

const fetchTime = async () => {
  const response = await API.get(API_ROUTES.TIME)
  return response.data
}

const fetchSessionWord = async () => {
  const response = await API.get(API_ROUTES.GET_SESSION_WORD)
  return response.data
}

const fetchAllMcqs = async () => {
  const response = await API.get(API_ROUTES.GET_ALL_MCQ)
  return response.data
}

const fetchUserById = async (userId) => {
  const response = await API.get(API_ROUTES.GET_SINGLE_USER?.replace(':userId', userId))
  return response.data
}

// post api service

const addPlayUser = async (body = {}) => {
  try {
    const response = await API.post(`${API_ROUTES.POST_MCQ_QUESTIONS}`, body)
    return response.data
  } catch (error) {
    throw error
  }
}

// update api service

const updatePlayUser = async ({ body = {}, userId }) => {
  try {
    const response = await API.patch(
      `${API_ROUTES.SECURITY_ANSWER?.replace(':userId', userId)}`,
      body,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

const updateUserWithSection = async ({ body = {}, userId }) => {
  try {
    const response = await API.patch(`${API_ROUTES.UPDATE_USERS?.replace(':itemId', userId)}`, body)
    return response.data
  } catch (error) {
    throw error
  }
}

const updateValueItems = async ({ body = {}, userId }) => {
  try {
    const response = await API.patch(
      `${API_ROUTES.UPDATE_VALUES?.replace(':userId', userId)}`,
      body,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

// auth api service
const loginUser = async ({ body = {} }) => {
  try {
    const response = await API.post(`${API_ROUTES.LOGIN}`, body)
    return response.data
  } catch (error) {
    throw error
  }
}

const RegisterUser = async ({ body = {} }) => {
  try {
    const response = await API.post(`${API_ROUTES.REGISTER}`, body)
    return response.data
  } catch (error) {
    throw error
  }
}

export {
  // * Fetch
  fetchLeaderBoardData,
  fetchQuestions,
  fetchAllValues,
  fetchAllUsers,
  fetchLeaderBoardDataByLevel,
  fetchTime,
  fetchSessionWord,
  fetchAllMcqs,
  fetchUserById,

  // * Add
  addPlayUser,

  // * Update
  updatePlayUser,
  updateValueItems,
  updateUserWithSection,

  // * Auth
  loginUser,
  RegisterUser,
}
