import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Confirm Account Deletion',
	description: 'Confirm your account deletion request',
	alternates: {
		canonical: 'https://www.raindate.net/confirm-deletion'
	}
}

export default function ConfirmDeletionLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
