'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { FaBullseye, FaUsers, FaCheckCircle, FaPlus, FaClock } from 'react-icons/fa'

import EventCard from '@/components/EventCard'
import Navigation from '@/components/Navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, StatsCard } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { type EventType } from '@/types/backendDataTypes'

interface DashboardStats {
	total: number
	myEvents: number
	participating: number
	draft: number
	scheduling: number
	scheduled: number
	confirmed: number
	cancelled: number
}

export default function DashboardPage () {
	const { currentUser } = useUser()

	const greeting = useMemo(() => {
		const h = new Date().getHours()
		if (h < 12) {
			return 'Good morning'
		}
		if (h < 18) {
			return 'Good afternoon'
		}
		return 'Good evening'
	}, [])

	const displayName = useMemo(() => {
		if ((currentUser?.username) == null) { return '' }

		const nameParts = currentUser.username.split(/\s+/).filter(part => part.length > 0)
		if (nameParts.length === 0) { return '' }

		// Always include the first name
		let result = nameParts[0]

		// Add additional name parts if total length stays under 10 characters
		for (let i = 1; i < nameParts.length; i++) {
			const potential = result + ' ' + nameParts[i]
			if (potential.length <= 10) {
				result = potential
			} else {
				break
			}
		}

		return result
	}, [currentUser?.username])

	const [events, setEvents] = useState<EventType[] | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [userNames, setUserNames] = useState<Map<string, string>>(new Map())

	useEffect(() => {
		const loadEvents = async () => {
			if (!currentUser) {
				setEvents([])
				setLoading(false)
				return
			}

			try {
				const response = await api.get<{ events: EventType[]; total: number }>(`/v1/events?memberOf=${currentUser._id}`)
				setEvents(response.data.events)

				// Extract unique user IDs from all members
				const userIds = new Set<string>()
				response.data.events.forEach(event => {
					event.members.forEach(member => {
						userIds.add(member.userId)
					})
				})

				// Fetch user names for all user IDs
				const userNamesMap = new Map<string, string>()
				for (const userId of userIds) {
					try {
						const userResponse = await api.get(`/v1/users/${userId}`)
						const userData = userResponse.data as { username?: string; email?: string }
						const displayName = userData.username ?? userData.email ?? 'Unknown User'
						userNamesMap.set(userId, displayName)
					} catch (err) {
						console.warn(`Failed to fetch user ${userId}:`, err)
						userNamesMap.set(userId, 'Unknown User')
					}
				}
				setUserNames(userNamesMap)
			} catch (err) {
				console.error('Failed to load events:', err)
				setError('Failed to load events')
				setEvents([])
			} finally {
				setLoading(false)
			}
		}
		loadEvents()
	}, [currentUser])

	const stats = useMemo((): DashboardStats => {
		if (!events || !currentUser) {
			return { total: 0, myEvents: 0, participating: 0, draft: 0, scheduling: 0, scheduled: 0, confirmed: 0, cancelled: 0 }
		}

		const myEvents = events.filter(e =>
			e.members.some(m => m.userId === currentUser._id && (m.role === 'creator' || m.role === 'admin'))
		)

		const participating = events.filter(e =>
			e.members.some(m => m.userId === currentUser._id && m.role === 'participant')
		)

		return {
			total: events.length,
			myEvents: myEvents.length,
			participating: participating.length,
			draft: events.filter(e => e.status === 'draft').length,
			scheduling: events.filter(e => e.status === 'scheduling').length,
			scheduled: events.filter(e => e.status === 'scheduled').length,
			confirmed: events.filter(e => e.status === 'confirmed').length,
			cancelled: events.filter(e => e.status === 'cancelled').length
		}
	}, [events, currentUser])

	const upcomingEvents = useMemo(() => {
		if (!events) {
			return []
		}
		const now = Date.now()
		return events
			.filter(e => {
				const eventTime = e.scheduledTime ?? e.timeWindow.end
				return eventTime > now
			})
			.sort((a, b) => (a.scheduledTime ?? a.timeWindow.start) - (b.scheduledTime ?? b.timeWindow.start))
			.slice(0, 3)
	}, [events])

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="h-24 bg-gray-200 rounded"></div>
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />

			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
				<div className="space-y-10">
					{/* Welcome Section */}
					<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-10 text-white">
						<div className="max-w-3xl">
							<h1 className="text-4xl font-bold mb-3">
								{greeting}{', '}{displayName}{'!\r'}
							</h1>
							<p className="text-indigo-100 text-xl mb-8">
								{'Your events and schedule at a glance.'}
							</p>
							<div className="flex flex-wrap gap-4">
								<Link href="/events/new">
									<Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">
										<span className="flex items-center gap-2"><FaPlus className="text-sm" />{' Create New Event'}</span>
									</Button>
								</Link>
								<Link href="/events">
									<Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">
										{'View Events\r'}
									</Button>
								</Link>
							</div>
						</div>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<StatsCard
							title="My Events"
							value={stats.myEvents}
							description="Events I created/manage"
							icon={<FaBullseye className="text-2xl text-indigo-600" />}
						/>
						<StatsCard
							title="Participating"
							value={stats.participating}
							description="Events I'm invited to"
							icon={<FaUsers className="text-2xl text-blue-600" />}
						/>
						<StatsCard
							title="Upcoming"
							value={stats.confirmed}
							description="Ready to go"
							icon={<FaCheckCircle className="text-2xl text-green-600" />}
						/>
						<StatsCard
							title="In Progress"
							value={stats.scheduling}
							description="Currently scheduling"
							icon={<FaClock className="text-2xl text-yellow-600" />}
						/>
					</div>					{/* Upcoming Events */}
					<div className="w-full">
						<Card className="border-0 shadow-lg">
							<CardHeader className="pb-6">
								<div className="flex items-center justify-between">
									<CardTitle className="text-2xl">{'Upcoming Events'}</CardTitle>
									{events && events.length > 0 && (
										<Link
											href="/events"
											className="inline-flex items-center px-6 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
										>
											{'View Events'}
										</Link>
									)}
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								{(error != null) ? (
									<div className="text-center py-12">
										<p className="text-red-600 text-lg">{error}</p>
									</div>
								) : upcomingEvents.length === 0 ? (
									<div className="text-center py-12">
										<h3 className="text-xl font-medium text-gray-900 mb-3">{'No upcoming events'}</h3>
										<p className="text-gray-600 mb-6 text-lg">{'Create an event to get started.'}</p>
										<Link href="/events/new">
											<Button variant="primary" size="lg" className="px-8 py-3">
												<span className="flex items-center gap-2"><FaPlus className="text-sm" />{' Create New Event'}</span>
											</Button>
										</Link>
									</div>
								) : (
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
										{upcomingEvents.map(event => (
											<EventCard key={event._id} event={event} currentUser={currentUser} userNames={userNames} />
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
