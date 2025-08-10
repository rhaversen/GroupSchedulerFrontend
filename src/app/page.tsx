'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { useLogout } from '@/hooks/useLogout'
import { caveat, fredoka } from '@/lib/fonts'

const Dashboard: React.FC = () => {
	const { currentUser } = useUser()
	const { logout } = useLogout()

	const handleLogout = () => {
		logout('/')
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
				{/* Background Image */}
				<div className="absolute inset-0 opacity-20">
					<Image
						src="/images/landing_lake.webp"
						alt="A calm lake with rain and a golden stone creating ripples, against hills and a cloudy sky."
						draggable="false"
						className="object-cover w-full h-full"
						fill
						quality={100}
					/>
				</div>

				{/* Content */}
				<div className="relative z-10 px-6 sm:px-8 lg:px-10 py-20 mb-30">
					<div className="max-w-4xl mx-auto text-center">
						{/* Logo */}
						<div className="mb-12">
							<div className="w-[350px] h-auto mx-auto">
								<Image
									src="/svg/raindate-logo.svg"
									alt="RainDate Logo"
									draggable={false}
									width={350}
									height={140}
									priority
									className="w-full h-auto drop-shadow-lg"
								/>
							</div>
						</div>

						{/* Main Heading */}
						<h1 className={`${caveat.className} font-bold text-5xl md:text-6xl text-white mb-12 leading-tight drop-shadow-lg`}>
							{'Find the Time'}<br />
							{'to Do Some Things'}
						</h1>

						{/* Action Buttons */}
						<div className="space-y-4">
							{currentUser ? (
								<div className="flex flex-col items-center gap-4">
									<Link href="/dashboard">
										<Button
											size="lg"
											className={`${fredoka.className} text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:from-indigo-700 hover:to-purple-700 px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold cursor-pointer`}
										>
											{'Go to Dashboard'}
										</Button>
									</Link>
									<button
										onClick={handleLogout}
										className={`${fredoka.className} text-sm text-white text-opacity-80 hover:text-white underline transition-colors duration-300 mt-2 cursor-pointer`}
									>
										{'Logout'}
									</button>
								</div>
							) : (
								<div className="flex flex-col items-center gap-6">
									<div className="flex flex-col sm:flex-row gap-4">
										<Link href="/signup">
											<Button
												size="lg"
												className={`${fredoka.className} text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:from-indigo-700 hover:to-purple-700 px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold cursor-pointer`}
											>
												{'Sign Up'}
											</Button>
										</Link>
										<Link href="/login">
											<Button
												size="lg"
												variant="secondary"
												className={`${fredoka.className} text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:from-indigo-700 hover:to-purple-700 px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold cursor-pointer`}
											>
												{'Log In'}
											</Button>
										</Link>
									</div>
									<Link href="/reset-password">
										<button className={`${fredoka.className} text-sm text-white text-opacity-80 hover:text-white underline transition-colors duration-300 cursor-pointer`}>
											{'Reset Password'}
										</button>
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Decorative Elements */}
				<div className="absolute bottom-0 left-0 right-0">
					<svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 fill-gray-50">
						<path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
					</svg>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-20 px-6 sm:px-8 lg:px-10">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className={`${fredoka.className} text-3xl md:text-4xl font-bold text-gray-900 mb-4`}>
							{'Simple Group Scheduling'}
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							{'No more endless back-and-forth messages. Find times that work for everyone, effortlessly.'}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
							<div className="text-5xl mb-6">{'📅'}</div>
							<h3 className={`${fredoka.className} text-xl font-semibold text-gray-900 mb-4`}>
								{'Create Events'}
							</h3>
							<p className="text-gray-600 leading-relaxed">
								{'Set up events with flexible time windows and invite your group members.'}
							</p>
						</div>

						<div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
							<div className="text-5xl mb-6">{'🗳️'}</div>
							<h3 className={`${fredoka.className} text-xl font-semibold text-gray-900 mb-4`}>
								{'Share Availability'}
							</h3>
							<p className="text-gray-600 leading-relaxed">
								{'Everyone can share when they\'re free within the proposed time window.'}
							</p>
						</div>

						<div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
							<div className="text-5xl mb-6">{'✅'}</div>
							<h3 className={`${fredoka.className} text-xl font-semibold text-gray-900 mb-4`}>
								{'Confirm Time'}
							</h3>
							<p className="text-gray-600 leading-relaxed">
								{'Find the perfect time slot that works for everyone and confirm your event.'}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
