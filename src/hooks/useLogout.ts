import { useRouter } from 'next/navigation'

import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'

export const useLogout = () => {
	const router = useRouter()
	const { setCurrentUser } = useUser()

	const logout = async (redirectPath?: string) => {
		try {
			await api.post('/v1/auth/logout-local')
		} catch (error) {
			console.error('Logout failed:', error)
			// Even if logout request fails, clear local state and redirect
		} finally {
			setCurrentUser(null)
			if (redirectPath !== undefined) {
				router.push(redirectPath)
			}
		}
	}

	return { logout }
}
