'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'

import { EventCard } from '@/components/EventCard'
import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'
import { Button, Card, CardContent } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { type EventType } from '@/types/backendDataTypes'

interface EventsPageProps {
	title: string
	description: string
	mode: 'browse' | 'my-events' | 'participating'
}

interface EventsResponse {
	events: EventType[]
	total: number
}

export default function EventsPage ({ title, description, mode }: EventsPageProps) {
	const { currentUser } = useUser()

	// Filter states
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [viewTab, setViewTab] = useState<'all' | 'upcoming' | 'past'>('all')
	const [viewMode, setViewMode] = useState<'created' | 'admin' | 'both'>('both')

	// Data states
	const [events, setEvents] = useState<EventType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [total, setTotal] = useState(0)

	// Build query parameters based on mode and filters
	const buildQueryParams = useCallback(() => {
		const params: Record<string, string> = {}

		// Mode-specific parameters
		if (mode === 'browse') {
			params.public = 'true'
		} else if (mode === 'my-events' && currentUser) {
			if (viewMode === 'created') {
				params.createdBy = currentUser._id
			} else if (viewMode === 'admin') {
				params.adminOf = currentUser._id
			} else {
				params.memberOf = currentUser._id
			}
		} else if (mode === 'participating' && currentUser) {
			params.memberOf = currentUser._id
		}

		// Filter parameters
		if (statusFilter) {
			params.status = statusFilter
		}

		// Client-side filtering will be applied for search term and view tab
		return params
	}, [mode, viewMode, statusFilter, currentUser])

	// Load events from API
	const loadEvents = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)

			const params = buildQueryParams()
			const searchParams = new URLSearchParams(params)
			const queryString = searchParams.toString()
			const url = queryString ? `/v1/events?${queryString}` : '/v1/events'

			const response = await api.get<EventsResponse>(url)
			setEvents(response.data.events)
			setTotal(response.data.total)
		} catch (err) {
			console.error('Failed to load events:', err)
			setError('Failed to load events')
			setEvents([])
			setTotal(0)
		} finally {
			setLoading(false)
		}
	}, [buildQueryParams])

	// Load events when query parameters change
	useEffect(() => {
		loadEvents()
	}, [mode, viewMode, statusFilter, currentUser, loadEvents])

	// Check if authentication is required and user is not logged in
	const requiresAuth = mode !== 'browse'
	if (requiresAuth && !currentUser) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<EventsSubNav />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Card className="border-0 shadow-lg">
						<CardContent>
							<div className="text-center py-12">
								<div className="text-6xl mb-6">{'🔒'}</div>
								<h3 className="text-xl font-medium text-gray-900 mb-3">
									{'Authentication Required\r'}
								</h3>
								<p className="text-gray-600 mb-6">
									{'Please log in to view '}{mode === 'my-events' ? 'your events' : 'events you\'re participating in'}{'.\r'}
								</p>
								<Link href="/login">
									<Button variant="primary">
										{'Log In\r'}
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	// Filter events on the client side for search and time-based filtering
	const filterEvents = (events: EventType[]) => {
		let filtered = events

		// Search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase()
			filtered = filtered.filter(event =>
				event.name.toLowerCase().includes(term) ||
				event.description.toLowerCase().includes(term)
			)
		}

		// Time-based filter
		if (viewTab !== 'all') {
			const now = Date.now()
			if (viewTab === 'upcoming') {
				filtered = filtered.filter(event => {
					const eventTime = event.scheduledTime ?? event.timeWindow.end
					return eventTime > now
				})
			} else if (viewTab === 'past') {
				filtered = filtered.filter(event => {
					const eventTime = event.scheduledTime ?? event.timeWindow.end
					return eventTime <= now
				})
			}
		}

		return filtered
	}

	// Get filtered events for display
	const filteredEvents = filterEvents(events)

	// Status options based on mode
	const getStatusOptions = () => {
		const showDraft = mode !== 'browse'
		const showCancelled = mode !== 'browse'

		return [
			{ id: '', label: 'All Statuses', icon: '📋' },
			...(showDraft ? [{ id: 'draft', label: 'Draft', icon: '📝' }] : []),
			{ id: 'scheduling', label: 'Scheduling', icon: '🗓️' },
			{ id: 'scheduled', label: 'Scheduled', icon: '📅' },
			{ id: 'confirmed', label: 'Confirmed', icon: '✅' },
			...(showCancelled ? [{ id: 'cancelled', label: 'Cancelled', icon: '❌' }] : [])
		]
	}

	// Empty state message
	const getEmptyState = () => {
		if (mode === 'browse') {
			return {
				icon: '🌐',
				title: 'No public events found',
				description: viewTab === 'all'
					? 'There are no public events available right now. Check back later or create your own!'
					: viewTab === 'upcoming'
					? 'No upcoming public events found. Check back later!'
					: 'No past public events found.'
			}
		} else if (mode === 'my-events') {
			return {
				icon: '👑',
				title: 'No events found',
				description: viewMode === 'created'
					? viewTab === 'all'
						? 'You haven\'t created any events yet.'
						: viewTab === 'upcoming'
						? 'You don\'t have any upcoming events you created.'
						: 'You don\'t have any past events you created.'
					: viewMode === 'admin'
					? viewTab === 'all'
						? 'You don\'t have admin access to any events yet.'
						: viewTab === 'upcoming'
						? 'You don\'t have admin access to any upcoming events.'
						: 'You don\'t have admin access to any past events.'
					: viewTab === 'all'
					? 'You don\'t manage any events yet.'
					: viewTab === 'upcoming'
					? 'You don\'t manage any upcoming events.'
					: 'You don\'t manage any past events.'
			}
		} else {
			return {
				icon: '👥',
				title: 'No events found',
				description: viewTab === 'all'
					? 'You\'re not involved in any events yet. Browse public events or create your own!'
					: viewTab === 'upcoming'
					? 'No upcoming events found. Check back later or create a new event!'
					: 'No past events found.'
			}
		}
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-8">
					{/* Header */}
					<div className="text-center">
						<h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
						<p className="text-gray-600 mb-6">{description}</p>
					</div>

					{/* Filters */}
					<div className="space-y-6">
						{/* My Events View Mode Filter */}
						{mode === 'my-events' && (
							<div className="flex justify-center">
								<div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
									{[
										{ id: 'both', label: 'All managed events', icon: '👑' },
										{ id: 'created', label: 'Events I created', icon: '✨' },
										{ id: 'admin', label: 'Events I admin', icon: '⚙️' }
									].map((mode) => (
										<button
											key={mode.id}
											onClick={() => setViewMode(mode.id as 'created' | 'admin' | 'both')}
											className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
												viewMode === mode.id
													? 'text-indigo-600 bg-indigo-50'
													: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
											}`}
										>
											<span>{mode.icon}</span>
											<span>{mode.label}</span>
										</button>
									))}
								</div>
							</div>
						)}

						{/* Search */}
						<div className="flex justify-center">
							<div className="relative w-full max-w-md">
								<HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<input
									type="text"
									placeholder="Search events..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								/>
							</div>
						</div>

						{/* View Tabs */}
						<div className="flex justify-center">
							<div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
								{[
									{ id: 'all', label: 'All Events', icon: '📅' },
									{ id: 'upcoming', label: 'Upcoming', icon: '⏰' },
									{ id: 'past', label: 'Past', icon: '📜' }
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() => setViewTab(tab.id as 'all' | 'upcoming' | 'past')}
										className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
											viewTab === tab.id
												? 'text-indigo-600 bg-indigo-50'
												: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
										}`}
									>
										<span>{tab.icon}</span>
										<span>{tab.label}</span>
									</button>
								))}
							</div>
						</div>

						{/* Status Filter */}
						<div className="flex justify-center">
							<div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex flex-wrap">
								{getStatusOptions().map((status) => (
									<button
										key={status.id}
										onClick={() => setStatusFilter(status.id)}
										className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
											statusFilter === status.id
												? 'text-indigo-600 bg-indigo-50'
												: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
										}`}
									>
										<span>{status.icon}</span>
										<span>{status.label}</span>
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Events List */}
					<div>
						{loading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{[...Array(6)].map((_, i) => (
									<div key={i} className="animate-pulse">
										<div className="h-48 bg-gray-200 rounded-lg"></div>
									</div>
								))}
							</div>
						) : (error != null) ? (
							<Card className="border-0 shadow-lg">
								<CardContent>
									<div className="text-center py-12">
										<div className="text-6xl mb-6">{'❌'}</div>
										<h3 className="text-xl font-medium text-gray-900 mb-3">
											{'Failed to Load Events\r'}
										</h3>
										<p className="text-gray-600">
											{error}
										</p>
									</div>
								</CardContent>
							</Card>
						) : filteredEvents.length === 0 ? (
							<Card className="border-0 shadow-md">
								<CardContent>
									<div className="text-center py-12">
										<div className="text-6xl mb-6">{getEmptyState().icon}</div>
										<h3 className="text-xl font-medium text-gray-900 mb-3">
											{getEmptyState().title}
										</h3>
										<p className="text-gray-600">
											{getEmptyState().description}
										</p>
									</div>
								</CardContent>
							</Card>
						) : (
							<>
								<div className="flex items-center justify-between mb-6">
									<p className="text-gray-600">
										{filteredEvents.length === total
											? `${total} ${total === 1 ? 'event' : 'events'}`
											: `Showing ${filteredEvents.length} of ${total} events`
										}
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{filteredEvents.map((event) => (
										<EventCard key={event._id} event={event} />
									))}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
