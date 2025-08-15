import { useState, type ReactNode } from 'react'
import { FaClipboardList, FaCalendarAlt, FaCheckCircle, FaTimes, FaCalendarTimes } from 'react-icons/fa'

import { type EventType } from '@/types/backendDataTypes'

export interface FilterOptions {
	searchTerm: string
	statusFilter: string
	viewTab: 'upcoming' | 'past'
	viewMode: 'created' | 'admin' | 'participant' | 'both'
	visibilityFilter: 'all' | 'public' | 'private' | 'draft'
}

export interface StatusOption {
	id: string
	label: string
	icon: ReactNode
}

export interface EmptyState {
	icon: ReactNode
	title: string
	description: string
}

export function useEventsFilters () {
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [viewTab, setViewTab] = useState<'upcoming' | 'past'>('upcoming')
	const [viewMode, setViewMode] = useState<'created' | 'admin' | 'participant' | 'both'>('both')
	const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private' | 'draft'>('all')

	const filterEvents = (events: EventType[]) => {
		let filtered = events

		if (searchTerm) {
			const term = searchTerm.toLowerCase()
			filtered = filtered.filter(event =>
				event.name.toLowerCase().includes(term) ||
				event.description.toLowerCase().includes(term)
			)
		}

		// Filter by time (upcoming vs past)
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

		return filtered
	}

	const getStatusOptions = (): StatusOption[] => {
		return [
			{ id: '', label: 'All Statuses', icon: <FaClipboardList /> },
			{ id: 'pending', label: 'Pending', icon: <FaCalendarAlt /> },
			{ id: 'confirmed', label: 'Confirmed', icon: <FaCheckCircle /> },
			{ id: 'cancelled', label: 'Cancelled', icon: <FaTimes /> }
		]
	}

	const getEmptyState = (viewTab: 'upcoming' | 'past', viewMode: 'created' | 'admin' | 'participant' | 'both'): EmptyState => {
		return {
			icon: <FaCalendarTimes />,
			title: 'No events found',
			description: viewMode === 'created'
				? viewTab === 'upcoming'
					? 'You don\'t have any upcoming events you created.'
					: 'You don\'t have any past events you created.'
				: viewMode === 'admin'
				? viewTab === 'upcoming'
					? 'You don\'t have admin access to any upcoming events.'
					: 'You don\'t have admin access to any past events.'
				: viewMode === 'participant'
				? viewTab === 'upcoming'
					? 'You\'re not participating in any upcoming events.'
					: 'You haven\'t participated in any past events.'
				: viewTab === 'upcoming'
				? 'You don\'t have any upcoming events.'
				: 'You don\'t have any past events.'
		}
	}

	return {
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
	}
}
