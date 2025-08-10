import { useState } from 'react'

import { type EventType } from '@/types/backendDataTypes'

export interface FilterOptions {
	searchTerm: string
	statusFilter: string
	viewTab: 'all' | 'upcoming' | 'past'
	viewMode: 'created' | 'admin' | 'both'
}

export function useEventsFilters () {
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [viewTab, setViewTab] = useState<'all' | 'upcoming' | 'past'>('all')
	const [viewMode, setViewMode] = useState<'created' | 'admin' | 'both'>('both')

	const filterEvents = (events: EventType[]) => {
		let filtered = events

		if (searchTerm) {
			const term = searchTerm.toLowerCase()
			filtered = filtered.filter(event =>
				event.name.toLowerCase().includes(term) ||
				event.description.toLowerCase().includes(term)
			)
		}

		if (viewTab !== 'all') {
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
		}

		return filtered
	}

	const getStatusOptions = () => {
		return [
			{ id: '', label: 'All Statuses', icon: '📋' },
			{ id: 'draft', label: 'Draft', icon: '📝' },
			{ id: 'scheduling', label: 'Scheduling', icon: '🗓️' },
			{ id: 'scheduled', label: 'Scheduled', icon: '📅' },
			{ id: 'confirmed', label: 'Confirmed', icon: '✅' },
			{ id: 'cancelled', label: 'Cancelled', icon: '❌' }
		]
	}

	const getEmptyState = (viewTab: 'all' | 'upcoming' | 'past', viewMode: 'created' | 'admin' | 'both') => {
		return {
			icon: '👑',
			title: 'No events found',
			description: viewMode === 'created'
				? viewTab === 'all'
					? 'You haven\'t created any events yet.'
					: viewTab === 'upcoming'
					? 'You don\'t have any upcoming events you created.'
					: 'You don\'t have any past events you created.'
				: viewMode === 'admin'
				? viewTab === 'all'
					? 'You don\'t have admin access to any events yet.'
					: viewTab === 'upcoming'
					? 'You don\'t have admin access to any upcoming events.'
					: 'You don\'t have admin access to any past events.'
				: viewTab === 'all'
				? 'You\'re not involved in any events yet. Create your first event!'
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
		filterEvents,
		getStatusOptions,
		getEmptyState
	}
}
