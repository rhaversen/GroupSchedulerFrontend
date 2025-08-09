'use client'
import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'

import { useEntitySocket } from '@/hooks/CudWebsocket'
import { api } from '@/lib/api'
import { type SessionType } from '@/types/backendDataTypes'

import { useError } from './ErrorProvider'
import { useUser } from './UserProvider'

export default function AuthProvider ({ children }: Readonly<{ children: ReactNode }>): ReactNode {
	const { addError } = useError()
	const { setCurrentUser } = useUser()
	const router = useRouter()

	const [currentSession, setCurrentSession] = useState<string | null>(null)

	const checkAuthentication = useCallback(async (): Promise<void> => {
		try {
			const response = await api.get<string>('/v1/auth/is-authenticated')
			setCurrentSession(response.data)
		} catch {
			// If not authenticated, log out and redirect to login page
			setCurrentUser(null)
			setCurrentSession(null)
			await api.post('/v1/auth/logout-local').catch(() => {
				// Ignore logout errors if already logged out
			})
			router.push('/')
		}
	}, [router, setCurrentUser])

	// Run the authentication check on component mount
	useEffect(() => {
		if (currentSession === null) {
			checkAuthentication().catch(addError)
		}
	}, [currentSession, checkAuthentication, addError])

	// Listen for session CUD events
	useEntitySocket<SessionType>('session', {
		onDelete: (deletedSessionId) => {
			if (deletedSessionId === currentSession) {
				setCurrentUser(null)
				setCurrentSession(null)
				router.push('/')
			}
		}
	})

	return <>{children}</>
}
