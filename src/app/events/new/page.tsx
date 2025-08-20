'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FaPlus, FaTrash, FaUsers, FaTimes, FaClock, FaCalendarAlt, FaUserPlus, FaUserMinus } from 'react-icons/fa'

import AuthRequiredCard from '@/components/AuthRequiredCard'
import EventsSubNav from '@/components/EventsSubNav'
import EventTimeline from '@/components/EventTimeline'
import Navigation from '@/components/Navigation'
import PageHero from '@/components/PageHero'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import UserAvatar from '@/components/UserAvatar'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { type EventPostType, type UserType, type ITimeRange } from '@/types/backendDataTypes'

type ScheduleMode = 'fixed' | 'dynamic'
type Member = { userId: string; role: 'creator' | 'admin' | 'participant' }
type TimeRange = { start?: number; end?: number }
type DailyConstraint = { start: number; end?: number }

const parseDateTime = (value: string): number | null => {
	if (!value) {
		return null
	}
	const ms = new Date(value).getTime()
	return isNaN(ms) ? null : ms
}

// Local datetime (YYYY-MM-DDTHH:MM) for datetime-local inputs
const formatLocalDateTime = (ms: number): string => {
	const d = new Date(ms)
	const pad = (n: number) => String(n).padStart(2, '0')
	const yyyy = d.getFullYear()
	const mm = pad(d.getMonth() + 1)
	const dd = pad(d.getDate())
	const hh = pad(d.getHours())
	const mi = pad(d.getMinutes())
	return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

const formatTime = (minutes: number): string => {
	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

const parseTime = (timeStr: string): number => {
	const [hours, mins] = timeStr.split(':').map(Number)
	return (hours * 60) + mins
}

function BasicDetailsSection ({
	name, setName,
	description, setDescription,
	visibility, setVisibility,
	errors
}: {
	name: string
	setName: (value: string) => void
	description: string
	setDescription: (value: string) => void
	visibility: 'draft' | 'public' | 'private'
	setVisibility: (v: 'draft' | 'public' | 'private') => void
	errors: Record<string, string>
}) {
	return (
		<Card className="border-0 shadow-md" id="basic-details-section">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FaCalendarAlt /> {'Basic Details'}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">{'Name'}</label>
						<div className="relative">
							<input id="event-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								maxLength={50}
								className={`mt-1 w-full rounded-lg border bg-white pr-14 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-400/30 ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
									}`}
								placeholder="Team Offsite"
								aria-label="Event name"
							/>
							<span className="absolute top-1.5 right-2 text-[10px] font-medium text-gray-400 select-none">
								{`${name.length}/50`}
							</span>
						</div>
						{errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
					</div>

					<div className="space-y-2">
						<span className="block text-sm font-medium text-gray-700">{'Visibility'}</span>
						<div className="flex flex-wrap gap-4 text-sm">
							<label className="flex items-center gap-2">
								<input type="radio" name="visibility" checked={visibility === 'draft'} onChange={() => setVisibility('draft')} /> {'Draft'}
							</label>
							<label className="flex items-center gap-2">
								<input type="radio" name="visibility" checked={visibility === 'public'} onChange={() => setVisibility('public')} /> {'Public'}
							</label>
							<label className="flex items-center gap-2">
								<input type="radio" name="visibility" checked={visibility === 'private'} onChange={() => setVisibility('private')} /> {'Private'}
							</label>
						</div>
						{visibility === 'draft' && (
							<p className="text-[11px] text-gray-500 leading-relaxed">{'Only creators and admins can see the event.'}</p>
						)}
						{visibility === 'public' && (
							<p className="text-[11px] text-gray-500 leading-relaxed">{'Anyone can view the event.'}</p>
						)}
						{visibility === 'private' && (
							<p className="text-[11px] text-gray-500 leading-relaxed">{'Only added members can view the event.'}</p>
						)}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">{'Description'}</label>
					<div className="relative">
						<textarea id="event-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							maxLength={1000}
							className={`mt-1 w-full rounded-lg border bg-white pr-16 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-400/30 ${errors.description ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
								}`}
							rows={3}
							placeholder="Describe your event"
						/>
						<span className="absolute top-1.5 right-2 text-[10px] font-medium text-gray-400 select-none">
							{`${description.length}/1000`}
						</span>
					</div>
					{errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
				</div>

				{/* Visibility radio group handled above */}
			</CardContent>
		</Card>
	)
}

function StatusSchedulingSection ({
	scheduleMode, setScheduleMode,
	scheduledTime, setScheduledTime,
	durationDays, setDurationDays,
	durationHours, setDurationHours,
	durationMinutes, setDurationMinutes,
	errors,
	preferredTimes, setPreferredTimes,
	blackoutPeriods, setBlackoutPeriods,
	dailyConstraints, setDailyConstraints,
	timeWindowStart, timeWindowEnd,
	totalDurationMinutes,
	setTimeWindowStart, setTimeWindowEnd
}: {
	scheduleMode: ScheduleMode
	setScheduleMode: (mode: ScheduleMode) => void
	scheduledTime: string
	setScheduledTime: (time: string) => void
	durationDays: number
	setDurationDays: (v: number) => void
	durationHours: number
	setDurationHours: (v: number) => void
	durationMinutes: number
	setDurationMinutes: (v: number) => void
	errors: Record<string, string>
	preferredTimes: TimeRange[]
	setPreferredTimes: (ranges: TimeRange[]) => void
	blackoutPeriods: TimeRange[]
	setBlackoutPeriods: (ranges: TimeRange[]) => void
	dailyConstraints: DailyConstraint[]
	setDailyConstraints: (ranges: DailyConstraint[]) => void
	timeWindowStart: string
	timeWindowEnd: string
	totalDurationMinutes: number
	setTimeWindowStart: (v: string) => void
	setTimeWindowEnd: (v: string) => void
}) {
	// helper logic moved from TimePreferencesSection
	const addTimeRange = (setter: (ranges: TimeRange[]) => void, current: TimeRange[]) => {
		setter([...current, { start: undefined, end: undefined }])
	}
	const updateTimeRange = (
		setter: (ranges: TimeRange[]) => void,
		current: TimeRange[],
		index: number,
		field: 'start' | 'end',
		value: string
	) => {
		const updated = [...current]
		let ms = value ? parseDateTime(value) : null
		const minMs = parseDateTime(timeWindowStart)
		const maxMs = parseDateTime(timeWindowEnd)
		if (ms != null) {
			if (minMs != null && ms < minMs) { ms = minMs }
			if (maxMs != null && ms > maxMs) { ms = maxMs }
		}
		updated[index] = { ...updated[index], [field]: ms ?? undefined }
		setter(updated)
	}
	const removeTimeRange = (setter: (ranges: TimeRange[]) => void, current: TimeRange[], index: number) => {
		setter(current.filter((_, i) => i !== index))
	}
	const addDailyConstraint = () => setDailyConstraints([...dailyConstraints, { start: 9 * 60 }])
	const updateDailyConstraint = (index: number, field: 'start' | 'end', minutes: number) => {
		const updated = [...dailyConstraints]
		updated[index] = { ...updated[index], [field]: minutes }
		setDailyConstraints(updated)
	}
	const removeDailyConstraint = (index: number) => {
		setDailyConstraints(dailyConstraints.filter((_, i) => i !== index))
	}
	const toggleDailyConstraintEndTime = (index: number) => {
		const updated = [...dailyConstraints]
		const constraint = updated[index]
		if (constraint.end !== undefined) {
			// Remove end time
			updated[index] = { start: constraint.start }
		} else {
			// Add end time, default to start + 8 hours
			updated[index] = { ...constraint, end: constraint.start + (8 * 60) }
		}
		setDailyConstraints(updated)
	}
	const renderTimeRanges = (label: string, ranges: TimeRange[], setter: (ranges: TimeRange[]) => void) => (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium text-gray-700">{label}</h4>
				<button
					type="button"
					onClick={() => addTimeRange(setter, ranges)}
					className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center gap-1"
					aria-label={`Add ${label.toLowerCase()}`}
				>
					<FaPlus /> {'Add'}
				</button>
			</div>
			{ranges.length === 0 && <p className="text-xs text-gray-400">{'None'}</p>}
			{ranges.map((range, idx) => (
				<div key={idx} className="grid sm:grid-cols-2 gap-2 items-end">
					<div>
						<label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">{'Start'}</label>
							<input
								type="datetime-local"
								className="mt-1 w-full border rounded px-2 py-1 text-sm"
								value={range.start != null ? formatLocalDateTime(range.start) : ''}
								onChange={(e) => updateTimeRange(setter, ranges, idx, 'start', e.target.value)}
									min={timeWindowStart || undefined}
									max={timeWindowEnd || undefined}
							aria-label={`${label} start time ${idx + 1}`}
						/>
					</div>
					<div>
						<label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">{'End'}</label>
						<div className="flex gap-2">
							<input
								type="datetime-local"
								className="mt-1 w-full border rounded px-2 py-1 text-sm"
								value={range.end != null ? formatLocalDateTime(range.end) : ''}
								onChange={(e) => updateTimeRange(setter, ranges, idx, 'end', e.target.value)}
										min={timeWindowStart || undefined}
										max={timeWindowEnd || undefined}
								aria-label={`${label} end time ${idx + 1}`}
							/>
							<button
								type="button"
								onClick={() => removeTimeRange(setter, ranges, idx)}
								className="mt-1 h-8 w-8 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200"
								aria-label={`Remove ${label.toLowerCase()} ${idx + 1}`}
							>
								<FaTrash className="text-xs" />
							</button>
						</div>
					</div>
				</div>
			))}
		</div>
	)

	const startMs = parseDateTime(timeWindowStart)
	const endMs = parseDateTime(timeWindowEnd)
	const nowLocal = formatLocalDateTime(Date.now())
	const minEndLocal = formatLocalDateTime(Math.max(Date.now(), startMs ?? 0))
	const showTimeline = Boolean(
		startMs != null &&
		endMs != null &&
		endMs > startMs &&
		totalDurationMinutes > 0
	)

	return (
		<Card className="border-0 shadow-md" id="scheduling-section">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FaClock /> {'Scheduling'}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="space-y-2">
					<div className="flex flex-wrap gap-4">
						<label className="flex items-center gap-2 text-sm">
							<input type="radio" name="scheduleMode" checked={scheduleMode === 'dynamic'} onChange={() => setScheduleMode('dynamic')} />
							{'Dynamic Date'}
						</label>
						<label className="flex items-center gap-2 text-sm">
							<input type="radio" name="scheduleMode" checked={scheduleMode === 'fixed'} onChange={() => setScheduleMode('fixed')} />
							{'Fixed Date'}
						</label>
					</div>
					{scheduleMode === 'dynamic' && (
						<p className="text-[11px] text-gray-500 leading-relaxed">{'System picks the best start time within the window using preferred times, blackout periods, and daily constraints.'}</p>
					)}
					{scheduleMode === 'fixed' && (
						<p className="text-[11px] text-gray-500 leading-relaxed">{'Event will occur exactly at the scheduled start you set below.'}</p>
					)}
				</div>

				{/* Duration now integrated per mode below */}

				{scheduleMode === 'dynamic' && (
					<div className="space-y-4">
						<div className="grid md:grid-cols-3 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700">{'Time Window Start'}</label>
								<input id="time-window-start" type="datetime-local" value={timeWindowStart} onChange={(e) => setTimeWindowStart(e.target.value)} min={nowLocal} max={timeWindowEnd || undefined} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Time window start" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">{'Time Window End'}</label>
								<input id="time-window-end" type="datetime-local" value={timeWindowEnd} onChange={(e) => setTimeWindowEnd(e.target.value)} min={minEndLocal} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Time window end" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">{'Duration'}</label>
								<div className="mt-1 flex items-end gap-4">
									<div className="flex flex-col w-20">
										<input id="duration-days" type="number" value={durationDays} onChange={(e) => setDurationDays(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))} min={0} max={30} className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Duration in days" />
										<span className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">{'Days'}</span>
									</div>
									<div className="flex flex-col">
										<input type="time" value={formatTime(durationHours * 60 + durationMinutes)} onChange={(e) => { const totalMins = parseTime(e.target.value); setDurationHours(Math.floor(totalMins / 60)); setDurationMinutes(totalMins % 60) }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Duration in hours and minutes" />
										<span className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">{'HH:MM'}</span>
									</div>
								</div>
								{errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>}
							</div>
						</div>
						{errors.timeWindow && <p className="-mt-1 text-xs text-red-600">{errors.timeWindow}</p>}

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-medium text-gray-700">{'Daily Start Times'}</h4>
								<button
									type="button"
									onClick={addDailyConstraint}
									className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center gap-1"
									aria-label="Add daily start time"
								>
									<FaPlus /> {'Add'}
								</button>
							</div>
							<div className="space-y-2 text-[11px] text-gray-500 leading-relaxed">
								<p>
									{'These constraints specify what time of day the event is allowed to start on any given date within the time window.'}
								</p>
								<p>
									<strong>{'Start time only:'}</strong> {' The event can start at exactly this time each day (e.g., "9:00 AM" means the event must start at 9:00 AM).'}
								</p>
								<p>
									<strong>{'Start and end time:'}</strong> {' The event can start anywhere within this time range on each day (e.g., "9:00 AM - 5:00 PM" means the event can start anytime between 9:00 AM and 5:00 PM).'}
								</p>
								<p>
									<strong>{'Multiple constraints:'}</strong> {' Add multiple time windows for complex schedules (e.g., "9:00 AM - 12:00 PM" and "2:00 PM - 5:00 PM" for events that can start in the morning or afternoon, but not during lunch).'}
								</p>
								<p>
									<strong>{'💡 Tip:'}</strong> {' Set these times as wide as possible (e.g., 8:00 AM - 8:00 PM) to give the system more flexibility and increase the chance that all participants can attend. Avoid unrealistic hours like middle of the night unless your event specifically requires it.'}
								</p>
							</div>
							{dailyConstraints.length === 0 && <p className="text-xs text-gray-400">{'None'}</p>}
							{dailyConstraints.map((constraint, idx) => (
								<div key={idx} className="flex items-end gap-3">
									<div className="flex flex-col">
										<label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">{'Start'}</label>
										<input
											type="time"
											value={formatTime(constraint.start)}
											onChange={(e) => updateDailyConstraint(idx, 'start', parseTime(e.target.value))}
											className="mt-1 w-32 border rounded px-2 py-1 text-sm"
											aria-label={`Daily start time ${idx + 1}`}
										/>
									</div>
									{constraint.end !== undefined && (
										<div className="flex flex-col">
											<label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">{'End'}</label>
											<input
												type="time"
												value={formatTime(constraint.end)}
												onChange={(e) => updateDailyConstraint(idx, 'end', parseTime(e.target.value))}
												className="mt-1 w-32 border rounded px-2 py-1 text-sm"
												aria-label={`Daily end time ${idx + 1}`}
											/>
										</div>
									)}
									<div className="flex gap-2">
										{constraint.end === undefined ? (
											<button
												type="button"
												onClick={() => toggleDailyConstraintEndTime(idx)}
												className="h-8 px-3 flex items-center justify-center rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs"
												aria-label={`Add end time for constraint ${idx + 1}`}
											>
												{'Add End Time'}
											</button>
										) : (
											<button
												type="button"
												onClick={() => toggleDailyConstraintEndTime(idx)}
												className="h-8 px-3 flex items-center justify-center rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs"
												aria-label={`Remove end time for constraint ${idx + 1}`}
											>
												{'Remove End'}
											</button>
										)}
										<button
											type="button"
											onClick={() => removeDailyConstraint(idx)}
											className="h-8 w-8 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200"
											aria-label={`Remove daily constraint ${idx + 1}`}
										>
											<FaTrash className="text-xs" />
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{scheduleMode === 'fixed' && (
					<div className="grid md:grid-cols-3 gap-6">
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700">{'Scheduled Start'}</label>
							<input id="scheduled-time" type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} min={nowLocal} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Scheduled start time" />
							{errors.scheduledTime && <p className="mt-1 text-xs text-red-600">{errors.scheduledTime}</p>}
						</div>
						<div className="md:col-span-1">
							<label className="block text-sm font-medium text-gray-700">{'Duration'}</label>
							<div className="mt-1 flex items-end gap-4">
								<div className="flex flex-col w-20">
									<input type="number" value={durationDays} onChange={(e) => setDurationDays(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))} min={0} max={30} className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Duration in days" />
									<span className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">{'Days'}</span>
								</div>
								<div className="flex flex-col">
									<input type="time" value={formatTime(durationHours * 60 + durationMinutes)} onChange={(e) => { const totalMins = parseTime(e.target.value); setDurationHours(Math.floor(totalMins / 60)); setDurationMinutes(totalMins % 60) }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Duration in hours and minutes" />
									<span className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">{'HH:MM'}</span>
								</div>
							</div>
							{errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>}
						</div>
					</div>
				)}

				{scheduleMode === 'dynamic' && (
					<div className="space-y-8">
						{renderTimeRanges('Preferred Times', preferredTimes, setPreferredTimes)}
						{renderTimeRanges('Blackout Periods', blackoutPeriods, setBlackoutPeriods)}
						{showTimeline && (
							<div>
								<h4 className="text-sm font-medium text-gray-700 mb-2">{'Timeline Preview'}</h4>
								<EventTimeline
									windowStart={startMs!}
									windowEnd={endMs!}
									duration={totalDurationMinutes * 60000}
									preferred={preferredTimes.filter((p): p is ITimeRange => p.start != null && p.end != null)}
									blackout={blackoutPeriods.filter((b): b is ITimeRange => b.start != null && b.end != null)}
									scheduledTime={undefined}
								/>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
function MembersSection ({
	allUsers, members, setMembers,
	memberSearch, setMemberSearch,
	currentUser
}: {
	allUsers: UserType[]
	members: Member[]
	setMembers: (members: Member[] | ((prev: Member[]) => Member[])) => void
	memberSearch: string
	setMemberSearch: (search: string) => void
	currentUser: UserType | null
}) {
	const filteredUsers = useMemo(() => allUsers.filter(user =>
		!members.some(m => m.userId === user._id) &&
		user.username.toLowerCase().includes(memberSearch.toLowerCase())
	), [allUsers, members, memberSearch])

	const toggleMember = useCallback((user: UserType) => {
		setMembers((prev: Member[]) => {
			const existing = prev.find((m: Member) => m.userId === user._id)
			if (existing) {
				if (currentUser && user._id === currentUser._id) {
					return prev
				}
				return prev.filter((m: Member) => m.userId !== user._id)
			}
			return [...prev, { userId: user._id, role: 'participant' }]
		})
	}, [setMembers, currentUser])

	const updateMemberRole = useCallback((userId: string, role: Member['role']) => {
		if (currentUser && userId === currentUser._id) {
			return
		}
		setMembers((prev: Member[]) => prev.map((m: Member) => m.userId === userId ? { ...m, role } : m))
	}, [setMembers, currentUser])

	const getUserById = useCallback((userId: string) => allUsers.find(u => u._id === userId) || currentUser, [allUsers, currentUser])

	return (
		<Card className="border-0 shadow-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FaUsers /> {'Members'}
				</CardTitle>
				<p className="mt-2 text-xs text-gray-500 leading-relaxed">
					{'Creators and Admins can modify event details, add or remove members. Only Creators can promote members to Admin or Creator roles.'}
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex flex-col gap-2">
					<input
						placeholder="Search users"
						value={memberSearch}
						onChange={(e) => setMemberSearch(e.target.value)}
						className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
					/>
					<div className="grid md:grid-cols-3 gap-2 max-h-64 overflow-auto p-2 border border-gray-200 rounded-lg bg-white shadow-inner">
						{filteredUsers.map(user => {
							const inMembers = members.some(m => m.userId === user._id)
							return (
								<button
									key={user._id}
									type="button"
									onClick={() => toggleMember(user)}
									className={`group text-left px-3 py-2 rounded-lg text-sm border flex items-center gap-2 transition shadow-sm ${inMembers
											? 'border-indigo-300 bg-indigo-50/70 text-indigo-700'
											: 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/60'
										}`}
									aria-label={`${inMembers ? 'Remove' : 'Add'} ${user.username} as member`}
								>
									<UserAvatar username={user.username} size="sm" className="shadow-inner" />
									<span className="flex-1 truncate text-xs">{user.username}</span>
									{inMembers ? (
										<FaUserMinus className="text-xs text-indigo-600 group-hover:scale-110 transition-transform" />
									) : (
										<FaUserPlus className="text-xs text-indigo-600 group-hover:scale-110 transition-transform" />
									)}
								</button>
							)
						})}
					</div>
				</div>

				<div className="space-y-3">
					{members.map(member => {
						const user = getUserById(member.userId)
						const isCurrentUser = Boolean(currentUser && member.userId === currentUser._id)
						const displayName = user?.username ?? member.userId

						return (
							<div key={member.userId} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
								<UserAvatar username={displayName} size="sm" />
								<div className="flex-1 min-w-0 flex items-center gap-2">
									<span className="text-sm font-medium truncate flex items-center gap-1">
										{displayName}
										{isCurrentUser && (
											<span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 tracking-tight">
												{'That\'s you!'}
											</span>
										)}
									</span>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									{isCurrentUser ? (
										<span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 whitespace-nowrap">
											{'Creator'}
										</span>
									) : (
										<div className="flex gap-1 whitespace-nowrap">
											{(['creator', 'admin', 'participant'] as const).map(roleOption => (
												<button
													key={roleOption}
													type="button"
													onClick={() => updateMemberRole(member.userId, roleOption)}
													className={`text-[10px] px-2 py-1 rounded border transition ${member.role === roleOption
														? 'bg-indigo-600 text-white border-indigo-600'
														: 'bg-white text-gray-600 border-gray-300 hover:bg-indigo-50'
													}`}
												>
													{roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
												</button>
											))}
										</div>
									)}
									{!isCurrentUser && (
										<button
											type="button"
											onClick={() => setMembers(members.filter(m => m.userId !== member.userId))}
											className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center gap-1 shadow-sm transition-colors whitespace-nowrap"
											aria-label={`Remove ${displayName} from members`}
										>
											<FaTrash className="text-[10px]" /> {'Remove'}
										</button>
									)}
								</div>
							</div>
						)
					})}
					{members.length === 0 && <p className="text-xs text-gray-400">{'No members yet.'}</p>}
				</div>
			</CardContent>
		</Card>
	)
}

const MemoizedMembersSection = React.memo(MembersSection, (prev, next) => {
	if (prev.currentUser?._id !== next.currentUser?._id) { return false }
	if (prev.memberSearch !== next.memberSearch) { return false }
	if (prev.allUsers.length !== next.allUsers.length) { return false }
	if (prev.members.length !== next.members.length) { return false }
	for (let i = 0; i < prev.members.length; i++) {
		const a = prev.members[i]; const b = next.members[i]
		if (a.userId !== b.userId || a.role !== b.role) { return false }
	}
	return true
})

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

		// Duration validation
		const totalMinutes = (durationDays * 24 * 60) + (durationHours * 60) + durationMinutes
		if (totalMinutes <= 0) {
			newErrors.duration = 'Duration must be greater than 0'
		}

		// Time-related validation differs by schedule mode
		if (scheduleMode === 'dynamic') {
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
			if (scheduledMs == null) {
				newErrors.scheduledTime = 'Scheduled time is required for fixed events'
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
			const order = ['name', 'description', 'timeWindow', 'duration', 'scheduledTime', 'members']
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
				}
			}
			if (targetId !== null) {
				setTimeout(() => {
					const el = document.getElementById(targetId)
					if (el) {
						el.scrollIntoView({ behavior: 'smooth', block: 'center' })
						;(el as HTMLElement).focus?.()
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
			const totalMinutes = (durationDays * 24 * 60) + (durationHours * 60) + durationMinutes
			const durationMs = totalMinutes * 60000
			const startMs = parseDateTime(timeWindowStart)
			const endMs = parseDateTime(timeWindowEnd)
			const scheduledTimeValue = scheduleMode === 'fixed' ? parseDateTime(scheduledTime) : undefined

			const completePreferred = preferredTimes.filter((p): p is ITimeRange => p.start != null && p.end != null)
			const completeBlackout = blackoutPeriods.filter((b): b is ITimeRange => b.start != null && b.end != null)

			const baseData: EventPostType = {
				name: name.trim(),
				duration: durationMs,
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

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />

			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-16">
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
						<BasicDetailsSection
							name={name} setName={setName}
							description={description} setDescription={setDescription}
							visibility={visibility} setVisibility={setVisibility}
							errors={errors}
						/>

						<StatusSchedulingSection
							scheduleMode={scheduleMode} setScheduleMode={setScheduleMode}
							scheduledTime={scheduledTime} setScheduledTime={setScheduledTime}
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

						<MemoizedMembersSection
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
	)
}
