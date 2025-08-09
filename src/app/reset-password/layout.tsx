import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Reset Password',
	description: 'Reset your RainDate account password',
	alternates: {
		canonical: 'https://www.raindate.net/reset-password'
	}
}

export default function ResetPasswordLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
