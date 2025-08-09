import type { Metadata } from 'next'
import { type ReactElement } from 'react'

import AuthProvider from '@/contexts/AuthProvider'

export const metadata: Metadata = {
	title: 'Dashboard',
	description: 'Your RainDate dashboard - manage events and schedule efficiently'
}

export default function DashboardLayout ({
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
