'use client'

import { useEffect, useState } from 'react'

import { Card, CardContent } from '@/components/ui'
import { api } from '@/lib/api'
import { type EventType } from '@/types/backendDataTypes'

import { EventCard } from './EventCard'

interface EventListProps {
	queryParams?: Record<string, string | string[]>
	emptyState?: {
		icon: string
		title: string
		description: string
	}
	className?: string
}

interface EventsResponse {
	events: EventType[]
	total: number
}

export function EventList ({
	queryParams = {},
	emptyState = {
		icon: '📅',
		title: 'No events found',
		description: 'No events match your current criteria.'
	},
	className = ''
}: EventListProps) {
	const [events, setEvents] = useState<EventType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [total, setTotal] = useState(0)

	useEffect(() => {
		const loadEvents = async () => {
			try {
				setLoading(true)
				setError(null)

				// Build query string from params
				const searchParams = new URLSearchParams()

				Object.entries(queryParams).forEach(([key, value]) => {
					if (Array.isArray(value)) {
						value.forEach(v => searchParams.append(key, v))
					} else if (value) {
						searchParams.append(key, value)
					}
				})

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
		}

		loadEvents()
	}, [queryParams])

	if (loading) {
		return (
			<div className={className}>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="animate-pulse">
							<div className="h-48 bg-gray-200 rounded-lg"></div>
						</div>
					))}
				</div>
			</div>
		)
	}

	if (error != null) {
		return (
			<div className={className}>
				<Card className="border-0 shadow-lg">
					<CardContent>
						<div className="text-center py-12">
							<div className="text-6xl mb-6">{'❌'}</div>
							<h3 className="text-xl font-medium text-gray-900 mb-3">
								{'Failed to Load Events'}
							</h3>
							<p className="text-gray-600">
								{error}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (events.length === 0) {
		return (
			<div className={className}>
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
			</div>
		)
	}

	return (
		<div className={className}>
			<div className="flex items-center justify-between mb-6">
				<p className="text-gray-600">
					{total === events.length
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
		</div>
	)
}
