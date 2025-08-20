'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaPlus, FaTimes, FaCheck, FaClock } from 'react-icons/fa'

import AuthRequiredCard from '@/components/AuthRequiredCard'
import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'
import BasicDetails from '@/components/new-event/BasicDetails'
import Members from '@/components/new-event/Members'
import Scheduling from '@/components/new-event/Scheduling'
import PageHero from '@/components/PageHero'
import { Button, Badge } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { type EventPostType, type UserType, type ITimeRange } from '@/types/backendDataTypes'
import { type ScheduleMode, type Member, type TimeRange, type DailyConstraint } from '@/types/newEvent'

function parseDateTime (value: string): number | null {
	if (!value) { return null }
	const ms = new Date(value).getTime()
	return Number.isNaN(ms) ? null : ms
}

export default function NewEventPage () {
	const { currentUser } = useUser()
	const router = useRouter()

	// Form state
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [visibility, setVisibility] = useState<'draft' | 'public' | 'private'>('draft')
	const [durationDays, setDurationDays] = useState(0)
	const [durationHours, setDurationHours] = useState(1)
	const [durationMinutes, setDurationMinutes] = useState(0)
	const [timeWindowStart, setTimeWindowStart] = useState('')
	const [timeWindowEnd, setTimeWindowEnd] = useState('')
	const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('dynamic')
	const [scheduledTime, setScheduledTime] = useState('')
	const [scheduledEnd, setScheduledEnd] = useState('')
	const [preferredTimes, setPreferredTimes] = useState<TimeRange[]>([])
	const [blackoutPeriods, setBlackoutPeriods] = useState<TimeRange[]>([])
	const [dailyConstraints, setDailyConstraints] = useState<DailyConstraint[]>([])
	const [members, setMembers] = useState<Member[]>([])
	const [memberSearch, setMemberSearch] = useState('')

	// UI state
	const [allUsers, setAllUsers] = useState<UserType[]>([])
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [submitting, setSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)

	// Load users and initialize current user as creator
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

	useEffect(() => {
		if (currentUser && !members.some(m => m.userId === currentUser._id)) {
			setMembers([{ userId: currentUser._id, role: 'creator' }])
		}
	}, [currentUser, members])

	// Sticky step bar active section tracking (must be before any early return)
	const [activeStep, setActiveStep] = useState<'basic' | 'scheduling' | 'members'>('basic')
	useEffect(() => {
		const sections = [
			{ id: 'basic-details-section', key: 'basic' as const },
			{ id: 'scheduling-section', key: 'scheduling' as const },
			{ id: 'members-section', key: 'members' as const }
		]
		const observer = new IntersectionObserver((entries) => {
			const visible = entries
				.filter(e => e.isIntersecting)
				.sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top))
			if (visible.length > 0) {
				const match = sections.find(s => s.id === (visible[0].target as HTMLElement).id)
				if (match) { setActiveStep(match.key) }
			}
		}, { root: null, rootMargin: '-40% 0px -50% 0px', threshold: [0, 1] })
		sections.forEach(s => {
			const el = document.getElementById(s.id)
			if (el) { observer.observe(el) }
		})
		return () => observer.disconnect()
	}, [])

	// Validation
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		// Basic validation
		if (!name.trim()) {
			newErrors.name = 'Name is required'
		} else if (name.trim().length > 50) {
			newErrors.name = 'Name must be 50 characters or less'
		}

		if (description.trim().length > 1000) {
			newErrors.description = 'Description must be 1000 characters or less'
		}

		// Time-related validation differs by schedule mode
		if (scheduleMode === 'dynamic') {
			// Duration validation for dynamic mode
			const totalMinutes = (durationDays * 24 * 60) + (durationHours * 60) + durationMinutes
			if (totalMinutes <= 0) {
				newErrors.duration = 'Duration must be greater than 0'
			}
			const startMs = parseDateTime(timeWindowStart)
			const endMs = parseDateTime(timeWindowEnd)
			if (startMs == null || endMs == null) {
				newErrors.timeWindow = 'Both start and end times are required'
			} else if (startMs >= endMs) {
				newErrors.timeWindow = 'Start time must be before end time'
			} else {
				const windowMinutes = Math.floor((endMs - startMs) / 60000)
				if (totalMinutes > windowMinutes) {
					newErrors.duration = 'Duration cannot exceed time window length'
				}
			}
		} else if (scheduleMode === 'fixed') {
			const scheduledMs = parseDateTime(scheduledTime)
			const scheduledEndMs = parseDateTime(scheduledEnd)
			if (scheduledMs == null) {
				newErrors.scheduledTime = 'Scheduled time is required for fixed events'
			}
			if (scheduledEndMs == null) {
				newErrors.scheduledEnd = 'Scheduled end time is required for fixed events'
			}
			if (scheduledMs != null && scheduledEndMs != null && scheduledEndMs <= scheduledMs) {
				newErrors.scheduledEnd = 'End must be after start'
			}
			// No time window required in fixed mode.
		}

		// Members validation
		if (!members.some(m => m.role === 'creator')) {
			newErrors.members = 'At least one creator is required'
		}

		setErrors(newErrors)
		const keys = Object.keys(newErrors)
		if (keys.length > 0) {
			const order = ['name', 'description', 'timeWindow', 'duration', 'scheduledTime', 'scheduledEnd', 'members']
			const orderedFirst = order.find(k => newErrors[k])
			let firstKey: string | null = null
			if (orderedFirst !== undefined) {
				firstKey = orderedFirst
			} else if (keys.length > 0) {
				firstKey = keys[0]
			}
			let targetId: string | null = null
			if (firstKey !== null) {
				if (firstKey === 'name') {
					targetId = 'event-name'
				} else if (firstKey === 'description') {
					targetId = 'event-description'
				} else if (firstKey === 'timeWindow') {
					targetId = 'time-window-start'
				} else if (firstKey === 'duration') {
					targetId = 'duration-days'
				} else if (firstKey === 'scheduledTime') {
					targetId = 'scheduled-time'
				} else if (firstKey === 'scheduledEnd') {
					targetId = 'scheduled-end'
				}
			}
			if (targetId !== null) {
				setTimeout(() => {
					const el = document.getElementById(targetId)
					if (el) {
						el.scrollIntoView({ behavior: 'smooth', block: 'center' })
							; (el as HTMLElement).focus?.()
					}
				}, 0)
			}
			return false
		}
		return true
	}

	// Form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setSubmitting(true)
		setSubmitError(null)

		try {
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
				// timeWindow optional; backend derives from scheduledTime + duration
			} else if (startMs != null && endMs != null) {
				baseData.timeWindow = { start: startMs, end: endMs }
			}

			if (completePreferred.length > 0) { baseData.preferredTimes = completePreferred }
			if (completeBlackout.length > 0) { baseData.blackoutPeriods = completeBlackout }
			if (dailyConstraints.length > 0) {
				const completeConstraints = dailyConstraints.map(constraint => ({
					start: constraint.start,
					end: constraint.end ?? constraint.start
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
			let errorMessage = 'Failed to create event'

			if (error != null && typeof error === 'object' && 'response' in error) {
				const response = (error as { response?: { data?: { message?: string } } }).response
				if (response?.data?.message != null && typeof response.data.message === 'string' && response.data.message.length > 0) {
					errorMessage = response.data.message
				}
			}

			setSubmitError(errorMessage)
		}
	}

	if (!currentUser) {
		return (
			<div className="min-h-screen bg-gray-50">
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

	const totalDurationMinutes = (durationDays * 24 * 60) + (durationHours * 60) + durationMinutes
	const statusPreview = scheduleMode === 'fixed' ? 'Confirmed (fixed date)' : 'Scheduling (dynamic)'

	const basicComplete = Boolean(name.trim() && name.trim().length <= 50)
	const schedulingComplete = scheduleMode === 'dynamic'
		? Boolean(parseDateTime(timeWindowStart) != null && parseDateTime(timeWindowEnd) != null && ((durationDays * 24 * 60) + (durationHours * 60) + durationMinutes) > 0)
		: (() => { const s = parseDateTime(scheduledTime); const e = parseDateTime(scheduledEnd); return s != null && e != null && e > s })()
	const membersComplete = members.some(m => m.role === 'creator')

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />

			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-16">
				<div className="space-y-6">
					<div className="sticky top-16 z-30 -mx-6 sm:-mx-8 lg:-mx-10 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/70 border-b border-gray-200">
						<nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
							<ol className="grid grid-cols-3 gap-2 py-3">
								{[
									{ href: '#basic-details-section', label: 'Basic details', complete: basicComplete, key: 'basic' as const },
									{ href: '#scheduling-section', label: 'Scheduling', complete: schedulingComplete, key: 'scheduling' as const },
									{ href: '#members-section', label: 'Members', complete: membersComplete, key: 'members' as const }
								].map((s, i) => (
									<li key={s.key}>
										<a href={s.href} className={`group flex items-center justify-center gap-2 text-xs sm:text-sm rounded-md border px-3 py-2 transition ${s.complete ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-600'
											} ${activeStep === s.key ? 'ring-2 ring-indigo-400/40' : ''}`}>
											<span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${s.complete ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-400 border-gray-300'
												}`}>
												{s.complete ? <FaCheck className="text-[10px]" /> : String(i + 1)}
											</span>
											<span className="truncate">{s.label}</span>
										</a>
									</li>
								))}
							</ol>
						</nav>
					</div>

					<div className="space-y-10">
						<PageHero title="Create Event" subtitle="Define an availability window, invite members, and schedule.">
							<div className="flex flex-wrap gap-3 mt-4 items-center">
								<Badge variant="info" className="text-xs flex items-center gap-1">
									<FaClock className="text-[10px]" /> {statusPreview}
								</Badge>
								{submitError != null && submitError.length > 0 && (
									<Badge variant="danger" className="text-xs flex items-center gap-1">
										<FaTimes className="text-[10px]" /> {submitError}
									</Badge>
								)}
							</div>
						</PageHero>

						<form onSubmit={handleSubmit} className="space-y-10">
							<BasicDetails
								name={name} setName={setName}
								description={description} setDescription={setDescription}
								visibility={visibility} setVisibility={setVisibility}
								errors={errors}
							/>

							<Scheduling
								scheduleMode={scheduleMode} setScheduleMode={setScheduleMode}
								scheduledTime={scheduledTime} setScheduledTime={setScheduledTime}
								scheduledEnd={scheduledEnd} setScheduledEnd={setScheduledEnd}
								durationDays={durationDays} setDurationDays={setDurationDays}
								durationHours={durationHours} setDurationHours={setDurationHours}
								durationMinutes={durationMinutes} setDurationMinutes={setDurationMinutes}
								errors={errors}
								preferredTimes={preferredTimes} setPreferredTimes={setPreferredTimes}
								blackoutPeriods={blackoutPeriods} setBlackoutPeriods={setBlackoutPeriods}
								dailyConstraints={dailyConstraints} setDailyConstraints={setDailyConstraints}
								timeWindowStart={timeWindowStart} timeWindowEnd={timeWindowEnd}
								totalDurationMinutes={totalDurationMinutes}
								setTimeWindowStart={setTimeWindowStart} setTimeWindowEnd={setTimeWindowEnd}
							/>

							<Members
								allUsers={allUsers} members={members} setMembers={setMembers}
								memberSearch={memberSearch} setMemberSearch={setMemberSearch}
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
		</div>
	)
}
