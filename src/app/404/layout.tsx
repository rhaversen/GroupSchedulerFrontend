import { type Metadata } from 'next'

export const metadata: Metadata = {
	title: '404',
	alternates: {
		canonical: 'https://www.raindate.net/not-found'
	}
}

export default function NotFoundLayout ({
	children
}: Readonly<{
    children: React.ReactNode
}>) {
	return <section>{children}</section>
}
