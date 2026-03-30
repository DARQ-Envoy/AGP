
  // authStatus.ts
type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

export const setFullyUnauthenticated = () => {
  sessionStorage.setItem('auth_status', 'unauthenticated')
}

export const setAuthenticated = () => {
  sessionStorage.setItem('auth_status', 'authenticated')
}

export const resetAuthStatus = () => {
  sessionStorage.removeItem('auth_status')
}

export const getAuthStatus = (): AuthStatus => {
  return (sessionStorage.getItem('auth_status') as AuthStatus) ?? 'unknown'
}