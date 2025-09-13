import { API_ROUTES } from '@/router/apiRoutes'
import API from './axios'

// play data fetch
const fetchLeaderBoardData = async ({ page = '1', userId = '68c3508d4e2d77b7ee79032e' }) => {
  const response = await API.get(`${API_ROUTES.PLAY}?page=${page}&loggedInUserId=${userId}`)
  return response.data
}

// auth api
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

export { fetchLeaderBoardData, loginUser, RegisterUser }
