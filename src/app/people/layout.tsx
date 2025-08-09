import { type Metadata } from 'next'
import { type ReactElement } from 'react'

import AuthProvider from '@/contexts/AuthProvider'

export const metadata: Metadata = {
	title: 'People',
	description: 'Discover and connect with other users on the platform'
}

export default function PeopleLayout ({
	children
}: {
	children: React.ReactNode
}): ReactElement {
	return (
		<AuthProvider>
			{children}
		</AuthProvider>
	)
}
