import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { type ReactElement } from 'react'

import ErrorProvider from '@/contexts/ErrorContext/ErrorProvider'
import UserProvider from '@/contexts/UserProvider'

import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: {
		template: '%s | RainDate',
		default: 'RainDate'
	},
	description: 'Find the Time to Do Some Things',
	keywords: 'event, planning, calendar, events, dashboard, availability, group scheduler, friends, holiday, vacation, plans, rally, RainDate, reindate, schedule, social gatherings, time, date, ocean, rain',
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
