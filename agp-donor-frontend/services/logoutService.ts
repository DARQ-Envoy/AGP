import { redirectTo } from '@/utils/redirect'
import { toast } from 'sonner'

export interface LogoutOptions {
  callBackend?: boolean
  redirect?: boolean
  redirectUrl?: string
}

const DEFAULT_OPTIONS: LogoutOptions = {
  callBackend: true,
  redirect: true,
  redirectUrl: '/auth',
}



// export const clearAuthState = async () => {
//   try {
//     const { store } = await import('@/redux/store')
//     const { logout } = await import('@/redux/features/auth/authSlice')
//     setTimeout(() => store.dispatch(logout()), 0)
//   } catch (error) {
//     console.debug('Redux logout dispatch skipped:', error)
//   }
// }


export const performLogout = async (options: LogoutOptions = DEFAULT_OPTIONS) => {
  const { callBackend, redirect, redirectUrl = '/auth' } = options

  if (callBackend) {
    try {
      const { instance } = await import('@/helpers/axios/axiosInstance')
      await instance.post('/auth/logout')
      toast.success('Logged out successfully.')
    } catch (error) {
      console.error('Backend logout failed:', error)
      toast.error('Failed to log out.')
    }
  }


  if (redirect) {
    console.log("redirecting", redirectUrl)
    // window.location.href = redirectUrl
    // window.location.assign('/auth')
    redirectTo(redirectUrl);
      // await clearAuthState() // await before redirecting
  }
}












export const logoutSilent = () =>
  performLogout({ callBackend: true, redirect: false })

export const logoutWithRedirect = (url: string) =>
  performLogout({ callBackend: false, redirect: true, redirectUrl: url })