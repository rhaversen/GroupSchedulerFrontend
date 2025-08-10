'use client'

import Link from 'next/link'

import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

export default function EventsPage () {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
				<div className="space-y-8">
					{/* Header */}
					<div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
						<div className="max-w-4xl">
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
								{'Events'}
							</h1>
							<p className="text-indigo-100 text-lg sm:text-xl mb-6 sm:mb-8">
								{'Create, manage, and join events.'}
							</p>
							<div className="flex flex-wrap gap-4">
								<Link href="/events/new">
									<Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">
										{'+ Create New Event'}
									</Button>
								</Link>
								<Link href="/events/my-events">
									<Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">
										{'View My Events'}
									</Button>
								</Link>
								<Link href="/events/browse">
									<Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">
										{'Browse Public Events'}
									</Button>
								</Link>
							</div>
						</div>
					</div>

					{/* Event Categories */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-3 mb-2">
									<span className="text-3xl">{'👑'}</span>
									<CardTitle className="text-xl">{'My Events'}</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 mb-6">
									{'Events you created or help manage.'}
								</p>
								<Link href="/events/my-events">
									<Button variant="primary" className="w-full">
										{'View My Events'}
									</Button>
								</Link>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-3 mb-2">
									<span className="text-3xl">{'🌐'}</span>
									<CardTitle className="text-xl">{'Public Events'}</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 mb-6">
									{'Find and join events from the community.'}
								</p>
								<Link href="/events/browse">
									<Button variant="primary" className="w-full">
										{'Browse Events'}
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>

					{/* Features Info */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-2xl flex items-center gap-3">
									<span className="text-2xl">{'✨'}</span>
									{'Event Features'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3 text-gray-600">
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1">{'✓'}</span>
										<span>{'Smart scheduling with time windows'}</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1">{'✓'}</span>
										<span>{'Participant availability tracking'}</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1">{'✓'}</span>
										<span>{'Real-time updates and notifications'}</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1">{'✓'}</span>
										<span>{'Public and private event options'}</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="text-green-500 mt-1">{'✓'}</span>
										<span>{'Easy participant management'}</span>
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-2xl flex items-center gap-3">
									<span className="text-2xl">{'🚀'}</span>
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
