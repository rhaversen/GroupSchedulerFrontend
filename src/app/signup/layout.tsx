import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Sign Up',
	description: 'Create your RainDate account to start scheduling events',
	alternates: {
		canonical: 'https://www.raindate.net/signup'
	}
}

export default function SignupLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
