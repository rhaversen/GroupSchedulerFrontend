import { useRouter } from 'next/navigation'

import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'

export const useLogout = () => {
	const router = useRouter()
	const { setCurrentUser } = useUser()

	const logout = async (redirectPath: string = '/login') => {
		try {
			await api.post('/v1/auth/logout-local')
			setCurrentUser(null)
			router.push(redirectPath)
		} catch (error) {
			console.error('Logout failed:', error)
			// Even if logout request fails, clear local state and redirect
			setCurrentUser(null)
			router.push(redirectPath)
		}
	}

	return { logout }
}
