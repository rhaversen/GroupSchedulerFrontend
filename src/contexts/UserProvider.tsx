'use client'

import axios from 'axios'
import Cookies from 'js-cookie'
import React, {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	type ReactElement,
	useContext,
	useEffect,
	useState
} from 'react'

import { type UserType } from '@/types/backendDataTypes'

interface UserContextType {
	currentUser: UserType | null
	setCurrentUser: Dispatch<SetStateAction<UserType | null>>
}

const UserContext = createContext<UserContextType>({
	currentUser: null,
	setCurrentUser: () => { }
})

export const useUser = (): UserContextType => useContext(UserContext)

export default function UserProvider ({ children }: { readonly children: ReactNode }): ReactElement {
	const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
		if (typeof window !== 'undefined') {
			const cookie = Cookies.get('currentUser')
			return (cookie != null) ? JSON.parse(cookie) : null
		}
		return null
	})

	// Fetch current user from backend if not set
	useEffect(() => {
		if (currentUser !== null || typeof window === 'undefined') { return }
		const API_URL = process.env.NEXT_PUBLIC_API_URL
		const fetchUser = async () => {
			const userRes = await axios.get<UserType>(`${API_URL}/v1/users/me`, { withCredentials: true })
			setCurrentUser(userRes.data)
			return
		}
		fetchUser().catch(() => {
			setCurrentUser(null)
		})
	}, [currentUser])

	useEffect(() => {
		if (currentUser !== null) {
			Cookies.set('currentUser', JSON.stringify(currentUser), { expires: 365, path: '/' })
		} else {
			Cookies.remove('currentUser', { path: '/' })
		}
	}, [currentUser])

	const value = React.useMemo(() => ({
		currentUser,
		setCurrentUser
	}), [currentUser])

	return (
		<UserContext.Provider value={value}>
			{children}
		</UserContext.Provider>
	)
}
