import { IGenericErrorResponse } from '@/types'
import axios from 'axios'
import { toast } from 'sonner'
import { setAuthenticated, setFullyUnauthenticated } from './authStatus'
import { performLogout, logoutWithRedirect } from '@/services/logoutService'

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60000,
})

// Debug: log configured axios baseURL at runtime (browser console)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line no-console
    console.debug('[axiosInstance] baseURL ->', instance.defaults.baseURL)
  } catch (e) {}
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Request Interceptor
// instance.interceptors.request.use((config) => {
//   const csrfToken = Cookies.get('XSRF-TOKEN')
//   if (csrfToken) {
//     config.headers['X-CSRF-Token'] = csrfToken
//   }
//   return config
// })


// Response Interceptor
instance.interceptors.response.use(
  function (response) {
    response.data = {
      success: response?.data?.success,
      statusCode: response?.data?.statusCode,
      message: response?.data?.message,
      data: response?.data?.data,
      meta: response?.data?.meta,
    }
    return response
  },

  async function (error) {
    const originalRequest = error.config

    // If the refresh endpoint itself returned 401, bail out immediately


    if (error?.response?.status === 401) {
      // Auth endpoints fail with 401 on bad credentials — do not attempt refresh
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        return Promise.reject({
          statusCode: 401,
          message: error?.response?.data?.message || 'Something went wrong!',
          errorMessages: error?.response?.data?.errorMessages || [],
        })
      }

        if (originalRequest.url?.includes('/auth/refresh-token')) {
      console.log("Refresh failed — redirecting to login")
      setFullyUnauthenticated()
      isRefreshing = false
      processQueue(error)
      failedQueue = []

      if (window.location.pathname.includes('/auth')) {
          window.dispatchEvent(new Event('auth:unauthenticated'))
      } else {
        performLogout({ callBackend: false, redirect: true, redirectUrl: '/auth' })
      }
        return Promise.reject(error)
    }
    console.log({isRefreshing})

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => instance(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      // Refresh succeeded
      try {
        await instance.post('/auth/refresh-token')
        console.log("refresh successful")
        processQueue(null)
        isRefreshing = false

        // If failedQueue was empty, request came from login page check
        setAuthenticated()
        return instance(originalRequest)
      }
      // Refresh failed
      catch (refreshError) {
        // Only reaches here for non-401 errors (network failure, 500, etc.)
        processQueue(refreshError)
        isRefreshing = false
        setFullyUnauthenticated()
   
  if (window.location.pathname.includes('/auth')) {
    // Already on auth page — fire event so form can react
    window.dispatchEvent(new Event('auth:unauthenticated'))
  } else {
    performLogout({ callBackend: false, redirect: true, redirectUrl: '/auth' })
  }
        return Promise.reject(refreshError)
      }
    }
    // Handle Forbidden (403)
    if (error?.response?.status === 403) {
      toast.error(error?.response?.data?.message || 'Access denied.')
      logoutWithRedirect('/unauthorized')
      return Promise.reject('Forbidden.')
    }

    // General Error Handling
    const responseObject: IGenericErrorResponse = {
      statusCode:
        error?.response?.status || error?.response?.data?.status || 500,
      message: error?.response?.data?.message || 'Something went wrong!',
      errorMessages: error?.response?.data?.errorMessages || [],
    }
    return Promise.reject(responseObject)
  }
)

export { instance }