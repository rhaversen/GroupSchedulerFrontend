'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactElement } from 'react'

import { Button } from '@/components/ui'
import { useLogout } from '@/hooks/useLogout'

const Navigation = (): ReactElement => {
	const pathname = usePathname()
	const { logout } = useLogout()

	const handleLogout = () => {
		logout('/')
	}

	const navItems = [
		{
			href: '/dashboard',
			label: 'Dashboard'
		},
		{
			href: '/events',
			label: 'Events'
		},
		{
			href: '/people',
			label: 'People'
		},
		{
			href: '/profile',
			label: 'My Profile'
		}
	]

	return (
		<nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link href="/dashboard" className="flex items-center">
								<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-2">
									<Image
										src="/svg/raindate-logo.svg"
										alt="RainDate"
										width={24}
										height={24}
										priority
										className="h-6 w-auto"
									/>
								</div>
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							{navItems.map((item) => {
								const isActive = item.href === '/events'
									? pathname.startsWith('/events')
									: pathname === item.href

								return (
									<Link
										key={item.href}
										href={item.href}
										className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
											isActive
												? 'border-indigo-500 text-gray-900'
												: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
										}`}
									>
										{item.label}
									</Link>
								)
							})}
						</div>
					</div>
					<div className="flex items-center">
						<Button
							variant="secondary"
							size="sm"
							onClick={handleLogout}
							className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
						>
							{'Logout'}
						</Button>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navigation
