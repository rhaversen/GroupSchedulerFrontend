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

			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
				<div className="space-y-10">
					{/* Header */}
					<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-10 text-white">
						<div className="max-w-3xl">
							<h1 className="text-4xl font-bold mb-3">
								{'Events'}
							</h1>
							<p className="text-indigo-100 text-xl mb-8">
								{'Manage your events, discover new ones, and connect with your community.'}
							</p>
							<div className="flex flex-wrap gap-4">
								<Link href="/events/new">
									<Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">
										{'+ Create New Event'}
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
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-3 mb-2">
									<span className="text-3xl">{'👑'}</span>
									<CardTitle className="text-xl">{'My Events'}</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 mb-6">
									{'Events where you are the creator or admin. Full control over scheduling, participants, and settings.'}
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
									<span className="text-3xl">{'👥'}</span>
									<CardTitle className="text-xl">{'Events I\'m In'}</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 mb-6">
									{'All events where you have any role - creator, admin, or participant. Your complete event involvement.'}
								</p>
								<Link href="/events/participating">
									<Button variant="primary" className="w-full">
										{'View All My Events'}
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
									{'Discover and join public events from the community. Find new activities and meet new people.'}
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
