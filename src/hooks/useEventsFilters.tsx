import { useState, type ReactNode } from 'react'
import { FaClipboardList, FaEdit, FaCalendar, FaCalendarAlt, FaCheckCircle, FaTimes, FaCalendarTimes } from 'react-icons/fa'

import { type EventType } from '@/types/backendDataTypes'

export interface FilterOptions {
	searchTerm: string
	statusFilter: string
	viewTab: 'upcoming' | 'past'
	viewMode: 'created' | 'admin' | 'participant' | 'both'
	publicFilter: 'all' | 'public' | 'private'
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
	const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'private'>('all')

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

		// Filter by public/private
		if (publicFilter !== 'all') {
			filtered = filtered.filter(event => {
				if (publicFilter === 'public') {
					return event.public === true
				} else {
					return event.public === false
				}
			})
		}

		return filtered
	}

	const getStatusOptions = (): StatusOption[] => {
		return [
			{ id: '', label: 'All Statuses', icon: <FaClipboardList /> },
			{ id: 'draft', label: 'Draft', icon: <FaEdit /> },
			{ id: 'scheduling', label: 'Scheduling', icon: <FaCalendar /> },
			{ id: 'scheduled', label: 'Scheduled', icon: <FaCalendarAlt /> },
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
		publicFilter,
		setPublicFilter,
		filterEvents,
		getStatusOptions,
		getEmptyState
	}
}
