'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactElement } from 'react'

const EventsSubNav = (): ReactElement => {
	const pathname = usePathname()

	const subNavItems = [
		{
			href: '/events/my-events',
			label: 'Events I Manage'
		},
		{
			href: '/events/participating',
			label: 'Events I\'m In'
		},
		{
			href: '/events/browse',
			label: 'Public Events'
		}
	]

	return (
		<div className="bg-gray-50 border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex space-x-8 overflow-x-auto">
					{subNavItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={`inline-flex items-center px-1 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
								pathname === item.href
									? 'text-indigo-600 border-b-2 border-indigo-600'
									: 'text-gray-500 hover:text-gray-700'
							}`}
						>
							{item.label}
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}

export default EventsSubNav
