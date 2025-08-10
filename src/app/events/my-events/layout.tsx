import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Events I Manage',
	description: 'Events where you are the creator or admin with full control'
}

export default function MyEventsLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
