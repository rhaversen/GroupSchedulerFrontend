'use client'

import Link from 'next/link'
import { FaTimes, FaPlus } from 'react-icons/fa'

import { Navigation, EventsSubNav, EventsFilters } from '@/components'
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
		publicFilter,
		setPublicFilter,
		filterEvents,
		getStatusOptions,
		getEmptyState
	} = useEventsFilters()

	const { events, loading, error, total } = useEventsData({
		viewMode,
		statusFilter,
		currentUser
	})

	if (userLoading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="animate-pulse space-y-6">
						<div className="h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl" />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
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
					{/* Header */}
					<div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
						<div className="max-w-4xl">
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
								{'My Events'}
							</h1>
							<p className="text-indigo-100 text-lg sm:text-xl mb-6 sm:mb-8">
								{'All events you\'re involved in - as creator, admin, or participant.'}
							</p>
						</div>

						<EventsFilters
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							statusFilter={statusFilter}
							setStatusFilter={setStatusFilter}
							viewTab={viewTab}
							setViewTab={setViewTab}
							viewMode={viewMode}
							setViewMode={setViewMode}
							publicFilter={publicFilter}
							setPublicFilter={setPublicFilter}
							statusOptions={statusOptions}
						/>
					</div>

					{/* Events Grid */}
					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(3)].map((_, i) => (
								<div
									key={i}
									className="animate-pulse animate-fade-in-slow opacity-0"
									style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}
								>
									<div className="h-48 bg-gray-200 rounded-lg" />
								</div>
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredEvents.map(event => (
									<EventCard key={event._id} event={event} currentUser={currentUser} />
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
