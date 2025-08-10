import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Events I\'m Participating In',
	description: 'Events where you are invited as a participant'
}

export default function ParticipatingLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
