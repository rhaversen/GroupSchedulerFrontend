'use client'

import Link from 'next/link'
import { type ReactElement, useState } from 'react'

import { useUser } from '@/contexts/UserProvider'
import { timeUntil } from '@/lib/timeUtils'

const UnconfirmedUserBanner = (): ReactElement | null => {
	const { currentUser } = useUser()
	const [isDismissed, setIsDismissed] = useState(false)

	if (!currentUser || currentUser.confirmed !== false || (currentUser.expirationDate == null) || isDismissed) {
		return null
	}

	const expirationTime = timeUntil(currentUser.expirationDate)
	const isExpired = expirationTime === 'Expired'

	// Check if expiration is very soon (less than 24 hours)
	const expirationDate = new Date(currentUser.expirationDate)
	const now = new Date()
	const hoursUntilExpiration = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60)
	const isUrgent = hoursUntilExpiration <= 24 && hoursUntilExpiration > 0

	return (
		<div className={`border-l-4 px-4 py-4 shadow-sm sticky top-16 z-40 animate-in slide-in-from-top-2 duration-300 ${
			isExpired || isUrgent
				? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-400'
				: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400'
		}`}>
			<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-start gap-3 flex-grow">
					<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
						isExpired || isUrgent
							? 'bg-red-100 animate-pulse'
							: 'bg-amber-100 animate-pulse'
					}`}>
						<span className={`text-lg ${
							isExpired || isUrgent ? 'text-red-600' : 'text-amber-600'
						}`} aria-label="Warning">{'⚠️'}</span>
					</div>
					<div className="flex-grow">
						<div className={`font-semibold text-base ${
							isExpired || isUrgent ? 'text-red-900' : 'text-amber-900'
						}`}>
							{isExpired ? 'Account Scheduled for Deletion' : 'Confirm Email to Prevent Account Deletion'}
						</div>
						<div className={`text-sm mt-1 ${
							isExpired || isUrgent ? 'text-red-700' : 'text-amber-700'
						}`}>
							{isExpired
								? 'Your account will be permanently deleted soon. Confirm your email immediately to prevent data loss.'
								: `Your account will be automatically deleted ${expirationTime} if not confirmed. All your events and data will be lost.`
							}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Link
						href="/confirm-email"
						className={`px-5 py-2.5 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
							isExpired || isUrgent
								? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
								: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500'
						}`}
					>
						{'Confirm Email Now\r'}
					</Link>
					<button
						onClick={() => setIsDismissed(true)}
						className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
							isExpired || isUrgent
								? 'text-red-600 hover:text-red-800 focus:ring-red-500'
								: 'text-amber-600 hover:text-amber-800 focus:ring-amber-500'
						}`}
						aria-label="Dismiss banner"
						type="button"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}

export default UnconfirmedUserBanner
