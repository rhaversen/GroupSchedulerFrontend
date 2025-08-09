import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Confirm Email',
	description: 'Confirm your email address to activate your RainDate account',
	alternates: {
		canonical: 'https://www.raindate.net/confirm'
	}
}

export default function ConfirmLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
