'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactElement, useMemo } from 'react'

import { useUser } from '@/contexts/UserProvider'

const EventsSubNav = (): ReactElement => {
	const pathname = usePathname()
	const { currentUser } = useUser()

	const subNavItems = useMemo(() => {
		const base = [
			{ href: '/events/my-events', label: 'My Events' },
			{ href: '/events/browse', label: 'Public Events' }
		]
		if (currentUser) {
			base.unshift({ href: '/events/new', label: 'Create Event' })
		}
		return base
	}, [currentUser])

	return (
		<div className="bg-gray-50 border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex space-x-8 overflow-x-auto">
					{subNavItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={`inline-flex items-center px-1 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
								pathname === item.href
									? 'text-indigo-600 border-indigo-600'
									: 'text-gray-500 hover:text-gray-700 border-transparent'
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
