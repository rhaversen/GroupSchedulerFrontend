import { useCallback, useEffect, useState } from 'react'

import { api } from '@/lib/api'
import { type EventType } from '@/types/backendDataTypes'

interface EventsResponse {
	events: EventType[]
	total: number
}

export interface UseEventsDataProps {
	viewMode?: 'created' | 'admin' | 'participant' | 'both'
	statusFilter?: string
	publicFilter?: 'all' | 'public' | 'private'
	currentUser?: { _id: string } | null
}

export function useEventsData ({ viewMode = 'both', statusFilter = '', publicFilter = 'all', currentUser }: UseEventsDataProps) {
	const [events, setEvents] = useState<EventType[]>([])
	const [loading, setLoading] = useState(true) // true only until first response
	const [isRefetching, setIsRefetching] = useState(false) // true for subsequent fetches while keeping old data
	const [error, setError] = useState<string | null>(null)
	const [total, setTotal] = useState(0)

	const buildQueryParams = useCallback(() => {
		const params: Record<string, string | string[]> = {}

		if (currentUser) {
			if (viewMode === 'created') {
				params.createdBy = currentUser._id
			} else if (viewMode === 'admin') {
				params.adminOf = currentUser._id
			} else if (viewMode === 'participant') {
				params.participantOf = currentUser._id
			} else {
				params.memberOf = currentUser._id
			}
		}

		if (statusFilter) {
			const parts = statusFilter.split(',').map(s => s.trim()).filter(Boolean)
			params.status = parts.length > 1 ? parts : parts[0]
		}

		if (publicFilter !== 'all') {
			params.public = publicFilter === 'public' ? 'true' : 'false'
		}

		return params
	}, [viewMode, statusFilter, publicFilter, currentUser])

	const loadEvents = useCallback(async () => {
		try {
			if (loading) {
				// initial load
				setLoading(true)
			} else {
				setIsRefetching(true)
			}
			setError(null)

			const params = buildQueryParams()
			const searchParams = new URLSearchParams()
			Object.entries(params).forEach(([key, value]) => {
				if (Array.isArray(value)) {
					value.forEach(v => searchParams.append(key, v))
				} else if (value !== undefined) {
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
			if (loading) {
				setLoading(false)
			}
			setIsRefetching(false)
		}
	}, [buildQueryParams, loading])

	useEffect(() => {
		loadEvents()
	}, [viewMode, statusFilter, publicFilter, currentUser, loadEvents])

	return {
		events,
		loading,
		isRefetching,
		error,
		total,
		refetch: loadEvents
	}
}
