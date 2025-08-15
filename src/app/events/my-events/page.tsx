'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaTimes, FaPlus } from 'react-icons/fa'

import { Navigation, EventsSubNav, EventsFilters, PageHero, EventCardSkeleton } from '@/components'
import AuthRequiredCard from '@/components/AuthRequiredCard'
import EventCard from '@/components/EventCard'
import { Card, CardContent, Button } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { useEventsFilters, useEventsData } from '@/hooks'

export default function MyEventsPage () {
	const { currentUser, userLoading } = useUser()

	const {
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		viewTab,
		setViewTab,
		viewMode,
		setViewMode,
		visibilityFilter,
		setVisibilityFilter,
		filterEvents,
		getStatusOptions,
		getEmptyState
	} = useEventsFilters()

// Map combined pending filter to underlying statuses for data hook using comma separation
const effectiveStatusFilter = statusFilter === 'pending' ? 'scheduling,scheduled' : statusFilter
const { events, loading, isRefetching, error, total } = useEventsData({
	viewMode,
	statusFilter: effectiveStatusFilter,
	visibilityFilter,
	currentUser
})

// Handle refetch indicator visibility with fade-out
const [showRefetchIndicator, setShowRefetchIndicator] = useState(false)
useEffect(() => {
	if (isRefetching === true) {
		setShowRefetchIndicator(true)
	} else if (showRefetchIndicator === true) {
		const t = setTimeout(() => setShowRefetchIndicator(false), 300)
		return () => clearTimeout(t)
	}
}, [isRefetching, showRefetchIndicator])

	if (userLoading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-10">
					<div className="space-y-8">
						<div className="h-48 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 animate-fade-in-slow opacity-0" style={{ animationDelay: '30ms', animationFillMode: 'forwards' }} />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{Array.from({ length: 6 }).map((_, i) => (
								<EventCardSkeleton key={i} index={i} />
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!currentUser) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<AuthRequiredCard message="Please log in to view your events." />
				</div>
			</div>
		)
	}

	const filteredEvents = filterEvents(events)
	const statusOptions = getStatusOptions()
	const emptyState = getEmptyState(viewTab, viewMode)

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			{currentUser !== null ? <EventsSubNav /> : null}
			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-10">
				<div className="space-y-8">
					<PageHero
						title="My Events"
						subtitle={'All events you\'re involved in - as creator, admin, or participant.'}
					>
						<EventsFilters
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							statusFilter={statusFilter}
							setStatusFilter={setStatusFilter}
							viewTab={viewTab}
							setViewTab={setViewTab}
							viewMode={viewMode}
							setViewMode={setViewMode}
							visibilityFilter={visibilityFilter}
							setVisibilityFilter={setVisibilityFilter}
							statusOptions={statusOptions}
						/>
					</PageHero>

					{/* Events Grid */}
					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{Array.from({ length: 6 }).map((_, i) => (
								<EventCardSkeleton key={i} index={i} />
							))}
						</div>
					) : error != null ? (
						<Card className="border-0 shadow-lg">
							<CardContent>
								<div className="text-center py-12">
									<div className="flex justify-center mb-6">
										<FaTimes className="text-6xl text-red-400" />
									</div>
									<h3 className="text-xl font-medium text-gray-900 mb-3">{'Failed to Load Events'}</h3>
									<p className="text-gray-600">{error}</p>
								</div>
							</CardContent>
						</Card>
					) : filteredEvents.length === 0 ? (
						<Card className="border-0 shadow-lg">
							<CardContent>
								<div className="text-center py-14 px-4">
									<div className="mx-auto mb-8 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
										<span className="text-5xl">{emptyState.icon}</span>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{emptyState.title}</h3>
									<p className="text-gray-600 mb-8 text-lg max-w-xl mx-auto leading-relaxed">{emptyState.description}</p>
									<div className="flex flex-wrap items-center justify-center gap-4">
										<Link href="/events/new">
											<Button variant="primary" size="lg" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow">
												<span className="flex items-center gap-2"><FaPlus className="text-sm" />{' Create Event'}</span>
											</Button>
										</Link>
										<Link href="/events/browse" className="inline-flex">
											<Button variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-8 py-3">
												{'Browse All Events'}
											</Button>
										</Link>
									</div>
								</div>
							</CardContent>
						</Card>
					) : (
						<>
							<div className="flex items-center justify-between mb-6">
								<p className="text-gray-600">
									{filteredEvents.length === total
										? `${total} ${total === 1 ? 'event' : 'events'}`
										: `Showing ${filteredEvents.length} of ${total} events`}
								</p>
							</div>
							<div className="relative">
								{showRefetchIndicator && (
									<div className={`pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-300 ${isRefetching === true ? 'opacity-100' : 'opacity-0'}`}>
										<div className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md flex items-center gap-3">
											<span className="inline-flex gap-3">
												<span className="w-3.5 h-3.5 rounded-full bg-white animate-bounce [animation-delay:0ms]" />
												<span className="w-3.5 h-3.5 rounded-full bg-white animate-bounce [animation-delay:140ms]" />
												<span className="w-3.5 h-3.5 rounded-full bg-white animate-bounce [animation-delay:280ms]" />
											</span>
										</div>
									</div>
								)}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200" style={{ opacity: isRefetching === true ? 0.65 : 1 }}>
									{filteredEvents.map(event => (
										<EventCard key={event._id} event={event} currentUser={currentUser} />
									))}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
