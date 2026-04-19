interface ApiError {
  statusCode: number
  code: string
  message: string
  details?: unknown[]
}

const codeMessages: Record<string, string> = {
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  INVALID_CREDENTIALS: 'Credenciais inválidas. Verifique o e-mail e a senha.',
  EMAIL_IN_USE: 'Este e-mail já está em uso.',
  NOT_FOUND: 'Recurso não encontrado.',
  APPOINTMENT_CONFLICT: 'Conflito de horário: médico ou paciente já tem consulta neste horário.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Acesso não autorizado.',
}

const INVALID_LOGIN_HINT = 'Credenciais inválidas. Verifique o e-mail e a senha.'

function isInvalidLoginAttempt(data: ApiError, requestUrl: string): boolean {
  if (data.code === 'INVALID_CREDENTIALS') return true
  const path = requestUrl.toLowerCase()
  if (path.includes('auth/login')) return true
  const msg = (data.message ?? '').toLowerCase()
  if (msg.includes('invalid credential')) return true
  return false
}

export function mapApiError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Erro inesperado. Tente novamente.'

  const axiosError = error as {
    response?: { data?: ApiError; config?: { url?: string } }
  }
  const data = axiosError.response?.data
  const requestUrl = axiosError.response?.config?.url ?? ''

  if (!data) return 'Erro de conexão. Verifique sua internet.'

  if (data.statusCode === 401 && isInvalidLoginAttempt(data, requestUrl)) {
    return INVALID_LOGIN_HINT
  }

  if (data.code && codeMessages[data.code]) {
    return codeMessages[data.code]
  }

  if (data.statusCode === 409) return codeMessages.APPOINTMENT_CONFLICT
  if (data.statusCode === 401) return codeMessages.UNAUTHORIZED
  if (data.statusCode === 403) return codeMessages.FORBIDDEN
  if (data.statusCode === 404) return codeMessages.NOT_FOUND
  if (data.statusCode === 400) return codeMessages.VALIDATION_ERROR

  return data.message ?? 'Erro inesperado. Tente novamente.'
}
