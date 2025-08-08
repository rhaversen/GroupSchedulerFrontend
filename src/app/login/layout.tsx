import { type Metadata } from 'next'

export const metadata: Metadata = {
	title: {
		template: '%s | RainDate',
		default: 'Login'
	},
	alternates: {
		canonical: 'https://www.raindate.net/login'
	}
}

export default function LoginLayout ({
	children
}: Readonly<{
    children: React.ReactNode
}>) {
	return <div>{children}</div>
}
