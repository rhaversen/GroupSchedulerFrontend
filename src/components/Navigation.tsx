'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactElement, useState } from 'react'

import { Button } from '@/components/ui'
import UnconfirmedUserBanner from '@/components/UnconfirmedUserBanner'
import { useUser } from '@/contexts/UserProvider'
import { useLogout } from '@/hooks/useLogout'

const Navigation = (): ReactElement => {
	const pathname = usePathname()
	const { currentUser } = useUser()
	const { logout } = useLogout()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const handleLogout = () => {
		logout('/dashboard')
	}

	const navItems = [
		{
			href: '/dashboard',
			label: 'Dashboard',
			show: true
		},
		{
			href: currentUser !== null ? '/events' : '/events/browse',
			label: 'Events',
			show: true
		},
		{
			href: '/people',
			label: 'People',
			show: true
		},
		{
			href: '/profile',
			label: 'My Profile',
			show: currentUser !== null
		}
	].filter(item => item.show)

	return (
		<>
			<nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
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
							{/* Nav list with responsive text sizing */}
							<div className="ml-4 flex space-x-4 max-[500px]:hidden">
								{navItems.map((item) => {
									const isEventsItem = item.label === 'Events'
									const isActive = isEventsItem ? pathname.startsWith('/events') : pathname === item.href
									return (
										<Link
											key={item.href}
											href={item.href}
											className={`inline-flex items-center pt-1 border-b-2 font-medium transition-colors px-0 sm:px-1 text-xs sm:text-sm ${isActive
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
							{currentUser !== null ? (
								<Button
									variant="secondary"
									size="sm"
									onClick={handleLogout}
									className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400 max-[500px]:hidden"
								>
									{'Logout'}
								</Button>
							) : (
								<div className="flex items-center gap-2 max-[500px]:hidden">
									<Link href="/login">
										<Button variant="secondary" size="sm" className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400">
											{'Log In'}
										</Button>
									</Link>
									<Link href="/signup">
										<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
											{'Sign Up'}
										</Button>
									</Link>
								</div>
							)}
							<button
								className="hidden max-[500px]:inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
								type="button"
							>
								<svg
									className="h-6 w-6"
									stroke="currentColor"
									fill="none"
									viewBox="0 0 24 24"
								>
									{mobileMenuOpen ? (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									) : (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h16"
										/>
									)}
								</svg>
							</button>
						</div>
					</div>
				</div>

				{mobileMenuOpen && (
					<div>
						<div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
							{navItems.map((item) => {
								const isEventsItem = item.label === 'Events'
								const isActive = isEventsItem ? pathname.startsWith('/events') : pathname === item.href
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors ${isActive
												? 'text-indigo-700 bg-indigo-50 border-r-4 border-indigo-500'
												: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
											}`}
										onClick={() => setMobileMenuOpen(false)}
									>
										{item.label}
									</Link>
								)
							})}
							{currentUser !== null ? (
								<div className="pl-3 pr-4 py-2">
									<Button
										variant="secondary"
										size="sm"
										onClick={handleLogout}
										className="w-full text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
									>
										{'Logout'}
									</Button>
								</div>
							) : (
								<div className="pl-3 pr-4 py-2 flex gap-3">
									<Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
										<Button variant="secondary" size="sm" className="w-full text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400">
											{'Log In'}
										</Button>
									</Link>
									<Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
										<Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
											{'Sign Up'}
										</Button>
									</Link>
								</div>
							)}
						</div>
					</div>
				)}
			</nav>
			<UnconfirmedUserBanner />
		</>
	)
}

export default Navigation
