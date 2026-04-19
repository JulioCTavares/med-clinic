import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

let _accessToken: string | null = null
let _refreshToken: string | null = null
let _onLogout: (() => void) | null = null

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function drainQueue(token: string | null, err: unknown = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(err)
  })
  failedQueue = []
}

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000',
  timeout: 15_000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Garantia contra reinstanciação/reload: reaproveita tokens persistidos.
  const access = _accessToken ?? localStorage.getItem('access_token')
  if (access) {
    _accessToken = access
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Skip retry for auth endpoints
    if (original.url?.includes('/auth/')) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
        .catch((err) => Promise.reject(err))
    }

    original._retry = true
    isRefreshing = true

    try {
      const refresh = _refreshToken ?? localStorage.getItem('refresh_token')
      if (!refresh) {
        _onLogout?.()
        return Promise.reject(error)
      }

      const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
        `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'}/auth/refresh`,
        { refresh_token: refresh },
      )
      _accessToken = data.access_token
      _refreshToken = data.refresh_token
      localStorage.setItem('access_token', _accessToken)
      if (_refreshToken) {
        localStorage.setItem('refresh_token', _refreshToken)
      }
      drainQueue(data.access_token)
      original.headers.Authorization = `Bearer ${data.access_token}`
      return api(original)
    } catch (err) {
      drainQueue(null, err)
      _onLogout?.()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)

export function setTokens(access: string, refresh: string) {
  _accessToken = access
  _refreshToken = refresh
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  _accessToken = null
  _refreshToken = null
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function getRefreshToken(): string | null {
  return _refreshToken ?? localStorage.getItem('refresh_token')
}

export function getAccessToken(): string | null {
  return _accessToken
}

export function setLogoutHandler(fn: () => void) {
  _onLogout = fn
}
