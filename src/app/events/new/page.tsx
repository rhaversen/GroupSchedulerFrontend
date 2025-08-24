'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { FaPlus } from 'react-icons/fa'

import AuthRequiredCard from '@/components/AuthRequiredCard'
import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'
import BasicDetails, { type BasicDetailsRef } from '@/components/new-event/BasicDetails'
import Members, { type MembersRef } from '@/components/new-event/Members'
import Scheduling, { type SchedulingRef } from '@/components/new-event/Scheduling'
import PageHero from '@/components/PageHero'
import { Button } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { type EventPostType, type UserType, type ITimeRange } from '@/types/backendDataTypes'

function parseDateTime (value: string): number | null {
	if (!value) { return null }
	const ms = new Date(value).getTime()
	return Number.isNaN(ms) ? null : ms
}

export default function NewEventPage () {
	const { currentUser } = useUser()
	const router = useRouter()

	const basicDetailsRef = useRef<BasicDetailsRef>(null)
	const schedulingRef = useRef<SchedulingRef>(null)
	const membersRef = useRef<MembersRef>(null)

	const [allUsers, setAllUsers] = useState<UserType[]>([])
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		const loadUsers = async () => {
			try {
				const response = await api.get<UserType[]>('/v1/users')
				setAllUsers(response.data)
			} catch (error) {
				console.error('Failed to load users:', error)
			}
		}
		loadUsers()
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		setSubmitting(true)

		try {
			const basicData = basicDetailsRef.current?.getFormData()
			const schedulingData = schedulingRef.current?.getFormData()
			const membersData = membersRef.current?.getFormData()

			if (!basicData || !schedulingData || !membersData) {
				throw new Error('Failed to collect form data')
			}

			const { name, description, visibility } = basicData
			const {
				scheduleMode, scheduledTime, scheduledEnd, durationDays, durationHours, durationMinutes,
				timeWindowStart, timeWindowEnd, preferredTimes, blackoutPeriods, dailyConstraints
			} = schedulingData
			const { members } = membersData

			const dynamicTotalMinutes = (durationDays * 24 * 60) + (durationHours * 60) + durationMinutes
			const dynamicDurationMs = dynamicTotalMinutes * 60000
			const startMs = parseDateTime(timeWindowStart)
			const endMs = parseDateTime(timeWindowEnd)
			const scheduledTimeValue = scheduleMode === 'fixed' ? parseDateTime(scheduledTime) : undefined
			const scheduledEndValue = scheduleMode === 'fixed' ? parseDateTime(scheduledEnd) : undefined

			const completePreferred = preferredTimes.filter((p): p is ITimeRange => p.start != null && p.end != null)
			const completeBlackout = blackoutPeriods.filter((b): b is ITimeRange => b.start != null && b.end != null)

			const baseData: EventPostType = {
				name: name.trim(),
				duration: scheduleMode === 'fixed' && scheduledTimeValue != null && scheduledEndValue != null && scheduledEndValue > scheduledTimeValue
					? (scheduledEndValue - scheduledTimeValue)
					: dynamicDurationMs,
				visibility,
				members: members.map(m => ({ userId: m.userId, role: m.role })),
				schedulingMethod: scheduleMode === 'fixed' ? 'fixed' : 'flexible'
			}

			if (description.trim()) {
				baseData.description = description.trim()
			}

			if (scheduleMode === 'fixed' && scheduledTimeValue != null) {
				baseData.scheduledTime = scheduledTimeValue
			} else if (startMs != null && endMs != null) {
				baseData.timeWindow = { start: startMs, end: endMs }
			}

			if (completePreferred.length > 0) { baseData.preferredTimes = completePreferred }
			if (completeBlackout.length > 0) { baseData.blackoutPeriods = completeBlackout }
			if (dailyConstraints.length > 0) {
				const completeConstraints = dailyConstraints.map(constraint => ({
					start: constraint.start,
					end: (constraint.end ?? constraint.start)
				}))
				baseData.dailyStartConstraints = completeConstraints
			}

			const response = await api.post('/v1/events', baseData)

			const rawData = response.data as Record<string, unknown>
			const eventId = (rawData?._id as string) || (rawData?.id as string)
			if (eventId && typeof eventId === 'string') {
				router.push(`/events/${eventId}`)
			} else {
				router.push('/events')
			}
		} catch (error: unknown) {
			setSubmitting(false)
			console.error('Failed to create event:', error)
		}
	}

	if (!currentUser) {
		return (
			<div className="min-h-screen bg-slate-50">
				<Navigation />
				<div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 pt-10 pb-16">
					<AuthRequiredCard
						title="Login Required"
						message="You need to log in to create a new event."
						redirectLabel="Log In"
						redirectHref="/login"
					/>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />

			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-16">
				<PageHero title="Create Your Event" subtitle="Make it happen" />
				<div className="mt-8">
					<form onSubmit={handleSubmit} className="space-y-10">
						<div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
							<div className="lg:col-span-2">
								<BasicDetails ref={basicDetailsRef} />
							</div>
							<div className="lg:col-span-3">
								<Scheduling ref={schedulingRef} />
							</div>
						</div>

						<Members
							ref={membersRef}
							allUsers={allUsers}
							currentUser={currentUser}
						/>

						<div className="flex justify-end gap-3">
							<Button
								type="button"
								onClick={() => router.push('/events')}
								variant="secondary"
								disabled={submitting}
							>
								{'Cancel'}
							</Button>
							<Button
								type="submit"
								disabled={submitting}
								className="flex items-center gap-2"
							>
								{submitting ? 'Creating...' : 'Create Event'} <FaPlus />
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
