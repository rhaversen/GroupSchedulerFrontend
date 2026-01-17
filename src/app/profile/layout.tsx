import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'My Profile',
	description: 'Manage your RainDate profile and account settings'
}

export default function ProfileLayout ({
	children
}: {
	children: React.ReactNode
}): ReactElement {
	return children as ReactElement
}
