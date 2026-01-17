'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FaCalendarCheck, FaGlobe, FaStar, FaCheck, FaRocket, FaPlus } from 'react-icons/fa'

import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'
import PageHero from '@/components/PageHero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'

export default function EventsPage () {
	const { currentUser } = useUser()
	const router = useRouter()

	useEffect(() => {
		if (currentUser === null) {
			// Redirect unauthenticated users to browse
			router.replace('/events/browse')
		}
	}, [currentUser, router])
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			{currentUser !== null ? <EventsSubNav /> : null}

			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-10">
				<div className="space-y-8">
					<PageHero
						title="Events"
						subtitle="Create, manage, and join events."
					/>

					{/* Primary Actions */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-2">
						<Link href="/events/new" className="group rounded-2xl bg-white shadow-md border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
							<div className="flex items-center gap-3">
								<span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><FaPlus className="text-lg" /></span>
								<h3 className="font-semibold text-gray-900 text-lg">{'Create Event'}</h3>
							</div>
							<p className="text-sm text-gray-600 flex-1">{'Start a new event by defining a time window and inviting others.'}</p>
							<span className="text-indigo-600 font-medium text-sm inline-flex items-center gap-1 group-hover:underline">{'Create now'}<FaRocket className="text-xs" /></span>
						</Link>
						<Link href="/events/my-events" className="group rounded-2xl bg-white shadow-md border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
							<div className="flex items-center gap-3">
								<span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><FaCalendarCheck className="text-lg" /></span>
								<h3 className="font-semibold text-gray-900 text-lg">{'My Events'}</h3>
							</div>
							<p className="text-sm text-gray-600 flex-1">{'Events you created or help manage. Continue planning or confirm times.'}</p>
							<span className="text-blue-600 font-medium text-sm group-hover:underline">{'Open list'}{' →'}</span>
						</Link>
						<Link href="/events/browse" className="group rounded-2xl bg-white shadow-md border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
							<div className="flex items-center gap-3">
								<span className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><FaGlobe className="text-lg" /></span>
								<h3 className="font-semibold text-gray-900 text-lg">{'Browse Public'}</h3>
							</div>
							<p className="text-sm text-gray-600 flex-1">{'Discover and join public events happening across the community.'}</p>
							<span className="text-green-600 font-medium text-sm group-hover:underline">{'Explore events'}{' →'}</span>
						</Link>
					</div>

					{/* Features Info */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-2xl flex items-center gap-3">
									<span className="text-2xl text-yellow-500"><FaStar /></span>
									{'Event Features'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3 text-gray-600">
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1"><FaCheck /></span>
										<span>{'Smart scheduling with time windows'}</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1"><FaCheck /></span>
										<span>{'Participant availability tracking'}</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1"><FaCheck /></span>
										<span>{'Real-time updates and notifications'}</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1"><FaCheck /></span>
										<span>{'Public and private event options'}</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1"><FaCheck /></span>
										<span>{'Easy participant management'}</span>
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-2xl flex items-center gap-3">
									<span className="text-2xl text-purple-500"><FaRocket /></span>
									{'Getting Started'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4 text-gray-600">
									<div className="flex items-start gap-3">
										<span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">{'1'}</span>
										<span>{'Create your first event with a time window'}</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">{'2'}</span>
										<span>{'Invite participants via email or share link'}</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">{'3'}</span>
										<span>{'Collect availability from all participants'}</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">{'4'}</span>
										<span>{'Schedule when everyone is available'}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
