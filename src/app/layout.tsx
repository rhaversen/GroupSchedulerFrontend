import type { Metadata } from 'next'
import { type ReactElement } from 'react'

import ErrorProvider from '@/contexts/ErrorProvider'
import UserProvider from '@/contexts/UserProvider'
import { geistMono, geistSans } from '@/lib/fonts'

import './globals.css'

export const metadata: Metadata = {
	title: {
		template: '%s | RainDate',
		default: 'RainDate'
	},
	description: 'Find the Time to Do Some Things',
	keywords: ['event', 'planning', 'calendar', 'events', 'dashboard', 'availability', 'group scheduler', 'friends', 'holiday', 'vacation', 'plans', 'rally', 'RainDate', 'reindate', 'schedule', 'social gatherings', 'time', 'date', 'ocean', 'rain', 'find the time to do some things', 'umbrella', 'date', 'group scheduling', 'group scheduling app', 'group scheduling tool'],
	alternates: {
		canonical: 'https://www.raindate.net'
	},
	icons: {
		icon: '/favicon.ico'
	}
}

export default function RootLayout ({
	children
}: Readonly<{
	children: React.ReactNode;
}>): ReactElement {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ErrorProvider>
					<UserProvider>
						{children}
					</UserProvider>
				</ErrorProvider>
			</body>
		</html>
	)
}
