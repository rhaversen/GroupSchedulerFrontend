import { type Metadata } from 'next'
import { type ReactElement } from 'react'

export const metadata: Metadata = {
	title: 'Page Not Found',
	description: 'The page you\'re looking for doesn\'t exist',
	alternates: {
		canonical: 'https://www.raindate.net/404'
	}
}

export default function NotFoundLayout ({
	children
}: Readonly<{
	children: React.ReactNode
}>): ReactElement {
	return <>{children}</>
}
