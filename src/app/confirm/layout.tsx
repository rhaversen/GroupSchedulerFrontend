import { type Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Confirm Email',
	alternates: {
		canonical: 'https://www.raindate.net/confirm'
	}
}

export default function ConfirmLayout ({
	children
}: Readonly<{
    children: React.ReactNode
}>) {
	return <div>{children}</div>
}
