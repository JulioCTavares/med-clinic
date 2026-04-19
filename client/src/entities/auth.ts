export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPatientPayload {
  email: string
  password: string
  name: string
  birthDate?: string
  phones?: string[]
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface AuthUser {
  id: string
  email: string
  role: 'patient' | 'doctor' | 'admin'
}

export interface JwtPayload {
  sub: string
  email: string
  role: 'patient' | 'doctor' | 'admin'
  jti: string
  exp: number
  iat: number
}
