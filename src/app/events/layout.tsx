import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Events',
	description: 'Manage your events, discover new ones, and connect with your community'
}

export default function EventsLayout ({
	children
}: {
	children: React.ReactNode
}): ReactElement {
	return children as ReactElement
}
