'use client'

import Link from 'next/link'

import { Badge, Card, CardContent } from '@/components/ui'
import { timeSince } from '@/lib/timeUtils'
import { type EventType } from '@/types/backendDataTypes'

interface EventCardProps {
	event: EventType
}

export function EventCard ({ event }: EventCardProps) {
	const getStatusColor = (status: EventType['status']) => {
		switch (status) {
			case 'draft':
				return 'bg-gray-100 text-gray-800'
			case 'scheduling':
				return 'bg-yellow-100 text-yellow-800'
			case 'scheduled':
				return 'bg-blue-100 text-blue-800'
			case 'confirmed':
				return 'bg-green-100 text-green-800'
			case 'cancelled':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const getStatusIcon = (status: EventType['status']) => {
		switch (status) {
			case 'draft':
				return '📝'
			case 'scheduling':
				return '⏰'
			case 'scheduled':
				return '📅'
			case 'confirmed':
				return '✅'
			case 'cancelled':
				return '❌'
			default:
				return '📋'
		}
	}

	const formatTimeDisplay = () => {
		if (event.scheduledTime != null) {
			return {
				label: 'Scheduled for',
				value: new Date(event.scheduledTime).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: '2-digit'
				})
			}
		}

		return {
			label: 'Time window',
			value: `${new Date(event.timeWindow.start).toLocaleDateString()} - ${new Date(event.timeWindow.end).toLocaleDateString()}`
		}
	}

	const timeDisplay = formatTimeDisplay()

	return (
		<Link href={`/events/${event._id}`}>
			<Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
				<CardContent className="p-6">
					<div className="space-y-4">
						{/* Header */}
						<div className="flex items-start justify-between">
							<div className="flex-1 min-w-0">
								<h3 className="text-lg font-semibold text-gray-900 truncate">
									{event.name}
								</h3>
								<p className="text-sm text-gray-600 mt-1 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
									{event.description}
								</p>
							</div>
							<div className="flex items-center gap-2 ml-4">
								{event.public && (
									<Badge variant="info" className="bg-purple-100 text-purple-800 text-xs">
										{'🌐 Public'}
									</Badge>
								)}
								<Badge className={`${getStatusColor(event.status)} text-xs`}>
									{getStatusIcon(event.status)} {event.status}
								</Badge>
							</div>
						</div>

						{/* Event Details */}
						<div className="space-y-3">
							<div className="flex items-center text-sm text-gray-600">
								<span className="mr-2">{'📅'}</span>
								<div>
									<span className="font-medium">{timeDisplay.label}{':'}</span>
									<span className="ml-1">{timeDisplay.value}</span>
								</div>
							</div>

							<div className="flex items-center justify-between text-sm text-gray-600">
								<div className="flex items-center">
									<span className="mr-2">{'👥'}</span>
									<span>{event.members.length}{' member'}{event.members.length !== 1 ? 's' : ''}</span>
								</div>
								<div className="flex items-center">
									<span className="mr-2">{'⏱️'}</span>
									<span>{Math.floor(event.duration / 60)}{'h '}{event.duration % 60}{'m'}</span>
								</div>
							</div>

							<div className="flex items-center text-xs text-gray-500">
								<span className="mr-2">{'🕒'}</span>
								<span>{'Updated '}{timeSince(event.updatedAt)}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}

export default EventCard
