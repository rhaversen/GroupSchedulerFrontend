'use client'
import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'

import { useEntitySocket } from '@/hooks/CudWebsocket'
import { api } from '@/lib/api'
import { type SessionType } from '@/types/backendDataTypes'

import { useError } from './ErrorProvider'
import { useUser } from './UserProvider'

export default function AdminAuthProvider ({ children }: Readonly<{ children: ReactNode }>): ReactNode {
	const { addError } = useError()
	const { setCurrentUser } = useUser()
	const router = useRouter()

	const [currentSession, setCurrentSession] = useState<string | null>(null)

	const checkAuthentication = useCallback(async (): Promise<void> => {
		try {
			const response = await api.get<string>('/v1/auth/is-authenticated')
			setCurrentSession(response.data)
		} catch {
			// If not authenticated, log out and redirect to admin login page
			setCurrentUser(null)
			setCurrentSession(null)
			await api.post('/v1/auth/logout-local')
			router.push('/login-admin')
		}
	}, [router, setCurrentUser])

	const checkAuthorization = useCallback(async (): Promise<void> => {
		try {
			// Check if user is an admin
			await api.get('/v1/auth/is-admin')
			// If admin, do nothing (let them stay on the current page)
		} catch {
			// If not admin, redirect to login page
			router.push('/login-admin')
		}
	}, [router])

	// Run the authentication and authorization checks on component mount
	useEffect(() => {
		if (currentSession === null) {
			checkAuthentication().then(checkAuthorization).catch(addError)
		}
	}, [currentSession, checkAuthentication, checkAuthorization, addError])

	// Listen for session CUD events
	useEntitySocket<SessionType>('session', {
		onDelete: (deletedSessionId) => {
			if (deletedSessionId === currentSession) {
				setCurrentUser(null)
				setCurrentSession(null)
				router.push('/login-admin')
			}
		}
	})

	return <>{children}</>
}
