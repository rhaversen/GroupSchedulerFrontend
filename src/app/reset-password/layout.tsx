import { type Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Reset Password',
	alternates: {
		canonical: 'https://www.raindate.net/reset-password'
	}
}

export default function ResetPasswordLayout ({
	children
}: Readonly<{
    children: React.ReactNode
}>) {
	return <div>{children}</div>
}
