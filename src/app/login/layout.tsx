import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Login',
	description: 'Sign in to your RainDate account',
	alternates: {
		canonical: 'https://www.raindate.net/login'
	}
}

export default function LoginLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
