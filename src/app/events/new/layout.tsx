import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Create Event',
	description: 'Create a new event and invite participants'
}

export default function NewEventLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
