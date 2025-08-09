'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import Navigation from '@/components/Navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, StatsCard } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { timeUntil } from '@/lib/timeUtils'
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

const EventCard = ({ event, currentUser, userNames }: { event: EventType; currentUser: { _id: string } | null; userNames: Map<string, string> }) => {
	const getUserRole = () => {
		const participant = event.participants.find(p => p.userId === currentUser?._id)
		return participant?.role || 'unknown'
	}

	const getCreator = () => {
		const creator = event.participants.find(p => p.role === 'creator')
		return creator
	}

	const getCreatorName = () => {
		const creator = getCreator()
		if (!creator) {
			return 'Unknown'
		}
		if (creator.userId === currentUser?._id) {
			return 'you'
		}
		// Use the fetched user name if available
		const userName = userNames.get(creator.userId)
		return userName != null ? userName : 'Unknown User'
	}

	const getRoleDisplay = (role: string) => {
		switch (role) {
			case 'creator':
				return { text: 'Creator', color: 'text-purple-600', icon: '👑', showRole: true }
			case 'admin':
				return { text: 'Admin', color: 'text-blue-600', icon: '⚙️', showRole: true }
			case 'participant':
				return { text: 'Participant', color: 'text-green-600', icon: '👤', showRole: false }
			default:
				return { text: 'Unknown', color: 'text-gray-600', icon: '❓', showRole: false }
		}
	}

	const eventTime = event.scheduledTime !== null && event.scheduledTime !== undefined
		? new Date(event.scheduledTime)
		: new Date(event.timeWindow.end)

	const isUpcoming = eventTime.getTime() > Date.now()
	const userRole = getUserRole()
	const roleDisplay = getRoleDisplay(userRole)
	const creator = getCreator()
	const creatorName = getCreatorName()

	return (
		<Card className="border-0 shadow-md">
			<CardContent>
				<div className="pt-2 mb-6">
					<div className="flex items-baseline gap-3 mb-2">
						<h3 className="font-semibold text-gray-900 truncate text-xl">
							{event.name}
						</h3>
						{creator && (
							<Link
								href={`/people/${creator.userId}`}
								className="text-sm text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer flex-shrink-0"
							>
								{'by '}{creatorName}
							</Link>
						)}
					</div>
					<p className="text-sm text-gray-600 line-clamp-2 mb-4">
						{event.description}
					</p>
					{roleDisplay.showRole && (
						<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-full mb-2">
							<span className="text-sm">{roleDisplay.icon}</span>
							<span className={`text-sm font-medium ${roleDisplay.color}`}>
								{'You\'re a '}{roleDisplay.text.toLowerCase()}{' of this event'}
							</span>
						</div>
					)}
				</div>

				<div className="space-y-4 text-sm text-gray-600">
					{event.scheduledTime !== null && event.scheduledTime !== undefined ? (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
									{'Scheduled'}
								</span>
								<span className="font-medium">
									{new Date(event.scheduledTime).toLocaleDateString()}
								</span>
							</div>
							{isUpcoming && (
								<span className="text-xs text-gray-500 font-medium">
									{timeUntil(event.scheduledTime)}
								</span>
							)}
						</div>
					) : (
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
								{'Window'}
							</span>
							<span>
								{new Date(event.timeWindow.start).toLocaleDateString()}{' - '}{new Date(event.timeWindow.end).toLocaleDateString()}
							</span>
						</div>
					)}

					<div className="flex items-center gap-2">
						<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
							{'Participants'}
						</span>
						<span>{event.participants.length}</span>
					</div>
				</div>

				<div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
					<span className="text-xs text-gray-500">
						{'Created '}{new Date(event.createdAt).toLocaleDateString()}
					</span>
					<Link
						href={`/events/${event._id}`}
						className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
					>
						{'View Details'}
					</Link>
				</div>
			</CardContent>
		</Card>
	)
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

				// Extract unique user IDs from all participants
				const userIds = new Set<string>()
				response.data.events.forEach(event => {
					event.participants.forEach(participant => {
						userIds.add(participant.userId)
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
			e.participants.some(p => p.userId === currentUser._id && (p.role === 'creator' || p.role === 'admin'))
		)

		const participating = events.filter(e =>
			e.participants.some(p => p.userId === currentUser._id && p.role === 'participant')
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
								{greeting}{', '}{currentUser?.username}{'!\r'}
							</h1>
							<p className="text-indigo-100 text-xl mb-8">
								{'Plan, share, and find the time that works for everyone.\r'}
							</p>
							<div className="flex flex-wrap gap-4">
								<Link href="/events/new">
									<Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">
										{'+ Create Event\r'}
									</Button>
								</Link>
								<Link href="/events">
									<Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">
										{'View All Events\r'}
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
							icon={<div className="h-6 w-6 text-indigo-600">{'🎯'}</div>}
						/>
						<StatsCard
							title="Participating"
							value={stats.participating}
							description="Events I'm invited to"
							icon={<div className="h-6 w-6 text-blue-600">{'👥'}</div>}
						/>
						<StatsCard
							title="Upcoming"
							value={stats.confirmed}
							description="Ready to go"
							icon={<div className="h-6 w-6 text-green-600">{'✅'}</div>}
						/>
						<StatsCard
							title="In Progress"
							value={stats.scheduling}
							description="Currently scheduling"
							icon={<div className="h-6 w-6 text-yellow-600">{'⏰'}</div>}
						/>
					</div>

					{/* Upcoming Events */}
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
											{'View All Events'}
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
										<p className="text-gray-600 mb-6 text-lg">{'Create your first event to get started with scheduling.'}</p>
										<Link href="/events/new">
											<Button variant="primary" size="lg" className="px-8 py-3">{'Create Event'}</Button>
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
