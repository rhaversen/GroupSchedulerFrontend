'use client'

import Link from 'next/link'

import { Navigation, EventsSubNav, EventsHeader, EventsFilters, EventsList } from '@/components'
import { Card, CardContent, Button } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { useEventsFilters, useEventsData } from '@/hooks'

export default function MyEventsPage () {
	const { currentUser } = useUser()

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

	const requiresAuth = true
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
									{'Please log in to view your events.\r'}
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

	const filteredEvents = filterEvents(events)
	const statusOptions = getStatusOptions()
	const emptyState = getEmptyState(viewTab, viewMode)

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-8">
					<EventsHeader
						title="My Events"
						description="All events you're involved in - as creator, admin, or participant."
					/>

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

					<EventsList
						events={filteredEvents}
						loading={loading}
						error={error}
						total={total}
						emptyState={emptyState}
					/>
				</div>
			</div>
		</div>
	)
}
