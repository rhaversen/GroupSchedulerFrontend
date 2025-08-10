import { useCallback, useEffect, useState } from 'react'

import { api } from '@/lib/api'
import { type EventType } from '@/types/backendDataTypes'

interface EventsResponse {
	events: EventType[]
	total: number
}

export interface UseEventsDataProps {
	viewMode?: 'created' | 'admin' | 'both'
	statusFilter?: string
	currentUser?: { _id: string } | null
}

export function useEventsData ({ viewMode = 'both', statusFilter = '', currentUser }: UseEventsDataProps) {
	const [events, setEvents] = useState<EventType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [total, setTotal] = useState(0)

	const buildQueryParams = useCallback(() => {
		const params: Record<string, string> = {}

		if (currentUser) {
			if (viewMode === 'created') {
				params.createdBy = currentUser._id
			} else if (viewMode === 'admin') {
				params.adminOf = currentUser._id
			} else {
				// 'both' mode - get all events user is involved in
				params.memberOf = currentUser._id
			}
		}

		if (statusFilter) {
			params.status = statusFilter
		}

		return params
	}, [viewMode, statusFilter, currentUser])

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

	useEffect(() => {
		loadEvents()
	}, [viewMode, statusFilter, currentUser, loadEvents])

	return {
		events,
		loading,
		error,
		total,
		refetch: loadEvents
	}
}
