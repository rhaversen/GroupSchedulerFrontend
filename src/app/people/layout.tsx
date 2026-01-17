import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'People',
	description: 'Discover and connect with other users on the platform'
}

export default function PeopleLayout ({
	children
}: {
	children: React.ReactNode
}): ReactElement {
	return children as ReactElement
}
