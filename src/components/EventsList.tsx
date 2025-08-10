import { EventCard } from '@/components/EventCard'
import { Card, CardContent } from '@/components/ui'
import { type EventType } from '@/types/backendDataTypes'

interface EventsListProps {
	events: EventType[]
	loading: boolean
	error: string | null
	total: number
	emptyState: {
		icon: string
		title: string
		description: string
	}
}

export default function EventsList ({
	events,
	loading,
	error,
	total,
	emptyState
}: EventsListProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="animate-pulse">
						<div className="h-48 bg-gray-200 rounded-lg"></div>
					</div>
				))}
			</div>
		)
	}

	if (error != null) {
		return (
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
		)
	}

	if (events.length === 0) {
		return (
			<Card className="border-0 shadow-md">
				<CardContent>
					<div className="text-center py-12">
						<div className="text-6xl mb-6">{emptyState.icon}</div>
						<h3 className="text-xl font-medium text-gray-900 mb-3">
							{emptyState.title}
						</h3>
						<p className="text-gray-600">
							{emptyState.description}
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<p className="text-gray-600">
					{events.length === total
						? `${total} ${total === 1 ? 'event' : 'events'}`
						: `Showing ${events.length} of ${total} events`
					}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{events.map((event) => (
					<EventCard key={event._id} event={event} />
				))}
			</div>
		</>
	)
}
