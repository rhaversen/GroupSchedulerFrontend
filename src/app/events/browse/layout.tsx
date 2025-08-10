import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Browse Public Events',
	description: 'Discover and join public events from the community'
}

export default function BrowseEventsLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
