import type { Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Dashboard',
	description: 'Your RainDate dashboard - manage events and schedule efficiently'
}

export default function DashboardLayout ({
	children
}: {
	children: React.ReactNode
}): ReactElement {
	return children as ReactElement
}
