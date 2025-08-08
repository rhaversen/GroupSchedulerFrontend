import { type Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Sign Up',
	alternates: {
		canonical: 'https://www.raindate.net/signup'
	}
}

export default function SignupLayout ({
	children
}: Readonly<{
    children: React.ReactNode
}>) {
	return <div>{children}</div>
}
