'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { FaBullseye, FaUsers, FaCheckCircle, FaPlus, FaClock, FaCalendarTimes } from 'react-icons/fa'

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
	const { currentUser, userLoading } = useUser()

	const greeting = useMemo(() => {
		const h = new Date().getHours()
		if (h < 12) { return 'Good morning' }
		if (h < 18) { return 'Good afternoon' }
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
const [enrichingNames, setEnrichingNames] = useState(false)

	useEffect(() => {
		let cancelled = false
		const load = async () => {
			if (userLoading) { return }
			if (!currentUser) {
				setEvents([])
				setLoading(false)
				return
			}
			try {
				const res = await api.get<{ events: EventType[]; total: number }>(`/v1/events?memberOf=${currentUser._id}`)
				if (cancelled) { return }
				const evts = res.data.events
				setEvents(evts)
				setLoading(false)
				const ids = new Set<string>()
				evts.forEach(e => e.members.forEach(m => ids.add(m.userId)))
				if (ids.size > 0) {
					setEnrichingNames(true)
					;(async () => {
						try {
							const pairs = await Promise.all(Array.from(ids).map(async id => {
								try {
									const ur = await api.get(`/v1/users/${id}`)
									const data = ur.data as { username?: string; email?: string }
									return [id, data.username ?? data.email ?? 'Unknown User'] as [string, string]
								} catch {
									return [id, 'Unknown User'] as [string, string]
								}
							}))
							if (!cancelled) { setUserNames(new Map(pairs)) }
						} finally {
							if (!cancelled) { setEnrichingNames(false) }
						}
					})()
				}
			} catch (e) {
				if (cancelled) { return }
				console.error('Failed to load events:', e)
				setError('Failed to load events')
				setEvents([])
				setLoading(false)
			}
		}
		load()
		return () => { cancelled = true }
	}, [currentUser, userLoading])

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

	const showMarketing = !userLoading && !currentUser
	if (showMarketing) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-16 space-y-10">
					<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-10 text-white shadow-md">
						<div className="max-w-3xl">
							<h1 className="text-4xl font-bold mb-4">{'Welcome to RainDate'}</h1>
							<p className="text-indigo-100 text-lg mb-8">{'Create, discover, and join events without scheduling conflicts. Sign up to start organizing or browse public events right now.'}</p>
							<div className="flex flex-wrap gap-4">
								<Link href="/signup"><Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">{'Sign Up'}</Button></Link>
								<Link href="/login"><Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3">{'Log In'}</Button></Link>
								<Link href="/events/browse"><Button variant="primary" size="lg" className="px-6 py-3">{'Browse Public Events'}</Button></Link>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Card className="border-0 shadow-md"><CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><FaBullseye className="text-indigo-600" />{' Smart Scheduling'}</CardTitle></CardHeader><CardContent className="text-gray-600">{'Define flexible time windows and let RainDate find the perfect conflict‑free time.'}</CardContent></Card>
						<Card className="border-0 shadow-md"><CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><FaUsers className="text-blue-600" />{' Seamless Invites'}</CardTitle></CardHeader><CardContent className="text-gray-600">{'Invite friends or join public events. Avoid overlap with everything else you care about.'}</CardContent></Card>
						<Card className="border-0 shadow-md"><CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><FaCheckCircle className="text-green-600" />{' Optimized Participation'}</CardTitle></CardHeader><CardContent className="text-gray-600">{'Everyone gets to attend the maximum number of events—no manual coordination needed.'}</CardContent></Card>
					</div>
				</div>
			</div>
		)
	}

	const statsLoading = userLoading || (currentUser != null && loading)

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
				<div className="space-y-10">
					<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-10 text-white">
						<div className="max-w-3xl">
							<h1 className="text-4xl font-bold mb-3">{currentUser ? `${greeting}, ${displayName || 'there'}!` : 'Dashboard'}</h1>
							<p className="text-indigo-100 text-xl mb-8">{'Your events and schedule at a glance.'}</p>
							<div className="flex flex-wrap gap-4">
								<Link href="/events/new"><Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3" disabled={!currentUser || userLoading}><span className="flex items-center gap-2"><FaPlus className="text-sm" />{' Create New Event'}</span></Button></Link>
								<Link href="/events/my-events"><Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3" disabled={!currentUser}>{'View My Events'}</Button></Link>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{['My Events','Participating','Upcoming','In Progress'].map((label, idx) => (
							statsLoading ? (
								<div key={label} className="h-32 rounded-xl bg-gray-200 animate-pulse" />
							) : (
								<StatsCard
									key={label}
									title={label}
									value={label === 'My Events' ? stats.myEvents : label === 'Participating' ? stats.participating : label === 'Upcoming' ? stats.confirmed : stats.scheduling}
									description={label === 'My Events' ? 'Events I created/manage' : label === 'Participating' ? 'Events I\'m invited to' : label === 'Upcoming' ? 'Ready to go' : 'Currently scheduling'}
									icon={idx === 0 ? <FaBullseye className="text-2xl text-indigo-600" /> : idx === 1 ? <FaUsers className="text-2xl text-blue-600" /> : idx === 2 ? <FaCheckCircle className="text-2xl text-green-600" /> : <FaClock className="text-2xl text-yellow-600" />}
								/>
							)
						))}
					</div>
					<div className="w-full">
						<Card className="border-0 shadow-lg">
							<CardHeader className="pb-6">
								<div className="flex items-center justify-between">
									<CardTitle className="text-2xl">{'Upcoming Events'}</CardTitle>
									{!loading && currentUser && events && events.length > 0 && (
										<Link href="/events/my-events" className="inline-flex items-center px-6 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">{'View My Events'}</Link>
									)}
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								{error != null ? (
									<div className="text-center py-12"><p className="text-red-600 text-lg">{error}</p></div>
								) : (loading || userLoading) ? (
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}</div>
								) : upcomingEvents.length === 0 ? (
									<div className="relative overflow-hidden rounded-xl">
										<div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10" />
										<div className="relative text-center py-14 px-6">
											<div className="mx-auto mb-8 flex items-center justify-center w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"><FaCalendarTimes className="text-4xl" /></div>
											<h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{'No upcoming events'}</h3>
											<p className="text-gray-600 mb-8 text-lg max-w-xl mx-auto leading-relaxed">{'Create an event, ask for an invite, or join public events.'}</p>
											<Link href="/events/new"><Button variant="primary" size="lg" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow"><span className="flex items-center gap-2"><FaPlus className="text-sm" />{' Create New Event'}</span></Button></Link>
										</div>
									</div>
								) : (
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
										{upcomingEvents.map(event => (
											<EventCard key={event._id} event={event} currentUser={currentUser} userNames={userNames} />
										))}
									</div>
								)}
								{enrichingNames && !loading && events && events.length > 0 && (
									<div className="mt-4 text-xs text-gray-400">{'Enhancing member info...'}</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
