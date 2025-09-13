import axios from 'axios'
import { baseUrl } from './config'
const API = axios.create({
  baseURL: baseUrl,
})

export default API
