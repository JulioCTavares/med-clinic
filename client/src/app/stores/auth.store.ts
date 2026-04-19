import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { api, setTokens, clearTokens, getRefreshToken, setLogoutHandler } from '@/shared/lib/api'
import type { AuthUser, JwtPayload, LoginPayload, RegisterPatientPayload, AuthTokens } from '@/entities/auth'
import type { Patient } from '@/entities/patient'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const patient = ref<Patient | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const patientId = computed(() => patient.value?.id ?? null)

  function _applyTokens(tokens: AuthTokens) {
    setTokens(tokens.access_token, tokens.refresh_token)
    const decoded = jwtDecode<JwtPayload>(tokens.access_token)
    user.value = { id: decoded.sub, email: decoded.email, role: decoded.role }
  }

  async function _fetchPatient() {
    const { data } = await api.get<{ id: string; email: string; role: string; patient?: Patient }>('/users/me')
    if (data.patient) patient.value = data.patient
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    try {
      const { data } = await api.post<AuthTokens>('/auth/login', payload)
      _applyTokens(data)
      await _fetchPatient()
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPatientPayload) {
    loading.value = true
    try {
      const { data } = await api.post<{
        id: string
        email: string
        role: 'patient'
        patient: Patient
        access_token?: string
        refresh_token?: string
      }>('/auth/register/patient', payload)

      // Registration doesn't return tokens — login immediately after
      const tokens = await api.post<AuthTokens>('/auth/login', {
        email: payload.email,
        password: payload.password,
      })
      _applyTokens(tokens.data)
      patient.value = data.patient
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore — always clear locally
    } finally {
      user.value = null
      patient.value = null
      clearTokens()
    }
  }

  async function restoreSession(): Promise<boolean> {
    const refresh = getRefreshToken()
    if (!refresh) return false
    try {
      const { data } = await api.post<AuthTokens>('/auth/refresh', { refresh_token: refresh })
      _applyTokens(data)
      await _fetchPatient()
      return true
    } catch {
      clearTokens()
      return false
    }
  }

  function init() {
    setLogoutHandler(() => {
      user.value = null
      patient.value = null
      clearTokens()
    })
  }

  return {
    user,
    patient,
    loading,
    isAuthenticated,
    patientId,
    login,
    register,
    logout,
    restoreSession,
    init,
  }
})
