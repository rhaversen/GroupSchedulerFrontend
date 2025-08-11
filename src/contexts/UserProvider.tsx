'use client'

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

import { api } from '@/lib/api'
import { type UserType } from '@/types/backendDataTypes'

interface UserContextType {
	currentUser: UserType | null
	setCurrentUser: Dispatch<SetStateAction<UserType | null>>
	userLoading: boolean
}

const UserContext = createContext<UserContextType>({
	currentUser: null,
	setCurrentUser: () => { },
	userLoading: true
})

export const useUser = (): UserContextType => useContext(UserContext)

export default function UserProvider ({ children }: { readonly children: ReactNode }): ReactElement {
const [currentUser, setCurrentUser] = useState<UserType | null>(null)
const [userLoading, setUserLoading] = useState(true)

useEffect(() => {
	const cookie = Cookies.get('currentUser')
	if (cookie != null) {
		setCurrentUser(JSON.parse(cookie))
		setUserLoading(false)
	} else {
		const fetchUser = async () => {
			try {
				const userRes = await api.get<UserType>('/v1/users/me')
				setCurrentUser(userRes.data)
			} catch {
				setCurrentUser(null)
			} finally {
				setUserLoading(false)
			}
		}
		fetchUser()
	}
}, [])

	useEffect(() => {
		if (currentUser !== null) {
			Cookies.set('currentUser', JSON.stringify(currentUser), { expires: 365, path: '/' })
		} else {
			Cookies.remove('currentUser', { path: '/' })
		}
	}, [currentUser])

const value = React.useMemo(() => ({
	currentUser,
	setCurrentUser,
	userLoading
}), [currentUser, userLoading])

	return (
		<UserContext.Provider value={value}>
			{children}
		</UserContext.Provider>
	)
}
