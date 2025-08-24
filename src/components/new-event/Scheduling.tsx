'use client'

import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { FaClock, FaMinus, FaPlus } from 'react-icons/fa'

import EventTimeline from '@/components/EventTimeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ITimeRange } from '@/types/backendDataTypes'
import { type DailyConstraint, type ScheduleMode, type TimeRange } from '@/types/newEvent'

function pad2 (n: number): string { return n < 10 ? `0${n}` : `${n}` }
function formatTime (minutes: number): string { const h = Math.floor(minutes / 60); const m = minutes % 60; return `${pad2(h)}:${pad2(m)}` }
function parseTime (timeStr: string): number { const [h, m] = timeStr.split(':').map(x => parseInt(x, 10) || 0); return (h * 60) + m }
function parseDateTime (value: string): number | null { if (!value) { return null } const ms = new Date(value).getTime(); return Number.isNaN(ms) ? null : ms }
function formatLocalDateTime (ms: number): string { const d = new Date(ms); const yyyy = d.getFullYear(); const mm = pad2(d.getMonth() + 1); const dd = pad2(d.getDate()); const hh = pad2(d.getHours()); const mi = pad2(d.getMinutes()); return `${yyyy}-${mm}-${dd}T${hh}:${mi}` }
function roundMsTo30Min (ms: number): number { const step = 30 * 60 * 1000; return Math.round(ms / step) * step }
function roundMinutesTo30 (mins: number): number { const v = Math.round(mins / 30) * 30; return Math.min(23 * 60 + 30, Math.max(0, v)) }
function formatLocalDate (ms: number): string { const d = new Date(ms); const yyyy = d.getFullYear(); const mm = pad2(d.getMonth() + 1); const dd = pad2(d.getDate()); return `${yyyy}-${mm}-${dd}` }
function formatLocalTimeOnly (ms: number): string { const d = new Date(ms); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}` }

function localDateAt (dateStr: string, hours = 0, minutes = 0): number {
	if (!dateStr) { return NaN }
	return new Date(`${dateStr}T${pad2(hours)}:${pad2(minutes)}`).getTime()
}
function shortDate (ms: number): string {
	return new Date(ms).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
function humanizeWindow (startMs?: number | null, endMs?: number | null, scheduledMs?: number | null, startLabel?: string, endLabel?: string, durationMinutes?: number): string {
	const now = Date.now()
	if (scheduledMs != null) {
		const diffDays = Math.round((scheduledMs - now) / (24 * 60 * 60 * 1000))
		const when = diffDays <= 0 ? 'soon' : diffDays === 1 ? 'tomorrow' : diffDays < 14 ? `in ${diffDays} days` : `in about ${Math.round(diffDays / 7)} weeks`
		const endDate = scheduledMs + (durationMinutes ?? 0) * 60000
		const endDateObj = new Date(endDate)
		const endDateStr = (durationMinutes != null) && durationMinutes >= 1440
			? `${shortDate(endDate)} at ${endLabel ?? endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
			: endLabel ?? endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		return `Scheduled for ${shortDate(scheduledMs)} at ${startLabel ?? new Date(scheduledMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${when}), ending ${endDateStr}`
	}
	if (startMs != null && endMs != null) {
		const from = shortDate(startMs)
		const to = shortDate(endMs)
		const d1 = Math.max(0, Math.round((startMs - now) / (24 * 60 * 60 * 1000)))
		const d2 = Math.max(0, Math.round((endMs - now) / (24 * 60 * 60 * 1000)))
		const span = d2 <= d1 ? '' : d2 - d1 < 14 ? ` (~${d1}–${d2} days from now)` : ` (~${Math.round(d1 / 7)}–${Math.round(d2 / 7)} weeks from now)`
		const durationDays = durationMinutes != null ? Math.floor(durationMinutes / 60 / 24) : 0
		return `Anytime between ${from} and ${to}${span}${(startLabel != null) && (endLabel != null) ? `, starting at ${startLabel} and ending ${(durationDays == 1) ? 'the day after' : `${durationDays > 1 ? `${durationDays} days later` : ''}`} at ${endLabel}` : ''}`
	}
	return ''
}

export interface SchedulingRef {
	getFormData: () => {
		scheduleMode: ScheduleMode
		scheduledTime: string
		scheduledEnd: string
		durationDays: number
		durationHours: number
		durationMinutes: number
		timeWindowStart: string
		timeWindowEnd: string
		preferredTimes: TimeRange[]
		blackoutPeriods: TimeRange[]
		dailyConstraints: DailyConstraint[]
	}
}

const Scheduling = forwardRef<SchedulingRef>((props, ref) => {
	const todayDateStr = useMemo(() => formatLocalDate(Date.now()), [])

	const [targetDate, setTargetDate] = useState('')

	// Core time-of-day
	const [dailyStartFromMin, setDailyStartFromMin] = useState(9 * 60)
	const [dailyEndToMin, setDailyEndToMin] = useState(17 * 60)

	// Time window
	const [rangeStartDate, setRangeStartDate] = useState('')
	const [rangeEndDate, setRangeEndDate] = useState('')

	// Constraints
	const [preferredTimes, setPreferredTimes] = useState<TimeRange[]>([])
	const [blackoutPeriods, setBlackoutPeriods] = useState<TimeRange[]>([])
	const [dailyConstraints] = useState<DailyConstraint[]>([{ start: 8 * 60, end: 20 * 60 }])
	const [showAdvanced, setShowAdvanced] = useState(false)

	// Duration controls (explicit)
	const [durDays, setDurDays] = useState(0)
	const durHours = 1 // Fixed at 1 hour
	const durMinutes = 0 // Fixed at 0 minutes
	const totalDurationMinutes = useMemo(() => (durDays * 24 * 60) + (durHours * 60) + durMinutes, [durDays])

	// Derived window from optional range dates; if one side missing, default to 7 days span
	const windowStartMs = useMemo(() => {
		if (rangeStartDate) { return roundMsTo30Min(localDateAt(rangeStartDate, 0, 0)) }
		return null
	}, [rangeStartDate])
	const windowEndMs = useMemo(() => {
		if (rangeEndDate) { return roundMsTo30Min(localDateAt(rangeEndDate, 23, 30)) }
		return null
	}, [rangeEndDate])

	// Simple derived calculations for display
	const flexibilityDaysBefore = useMemo(() => {
		if (!targetDate || !rangeStartDate) { return 0 }
		const targetMs = localDateAt(targetDate, 0, 0)
		const startMs = localDateAt(rangeStartDate, 0, 0)
		if (Number.isNaN(targetMs) || Number.isNaN(startMs)) { return 0 }
		return Math.max(0, Math.round((targetMs - startMs) / (24 * 60 * 60 * 1000)))
	}, [targetDate, rangeStartDate])

	const flexibilityDaysAfter = useMemo(() => {
		if (!targetDate || !rangeEndDate) { return 0 }
		const targetMs = localDateAt(targetDate, 0, 0)
		const endMs = localDateAt(rangeEndDate, 0, 0)
		if (Number.isNaN(targetMs) || Number.isNaN(endMs)) { return 0 }
		return Math.max(0, Math.round((endMs - targetMs) / (24 * 60 * 60 * 1000)))
	}, [targetDate, rangeEndDate])

	const hasWindow = useMemo(() => Boolean(rangeStartDate && rangeEndDate), [rangeStartDate, rangeEndDate])

	// Derived fixed schedule when no window and anchor is set
	const scheduledStartMs = useMemo(() => {
		if (!targetDate || hasWindow) { return null }
		const ms = localDateAt(targetDate, Math.floor(dailyStartFromMin / 60), dailyStartFromMin % 60)
		return Number.isNaN(ms) ? null : roundMsTo30Min(ms)
	}, [targetDate, hasWindow, dailyStartFromMin])

	const showTimeline = hasWindow && windowStartMs != null && windowEndMs != null

	// Preferred time derived from target date
	const targetPreferredRange = useMemo<ITimeRange | null>(() => {
		if (!targetDate) { return null }
		const start = roundMsTo30Min(localDateAt(targetDate, Math.floor(dailyStartFromMin / 60), dailyStartFromMin % 60))
		const end = start + totalDurationMinutes * 60000
		return { start, end }
	}, [targetDate, dailyStartFromMin, totalDurationMinutes])

	// Expose data
	useImperativeHandle(ref, () => ({
		getFormData: () => {
			const mode: ScheduleMode = hasWindow ? 'dynamic' : 'fixed'
			const timeWindowStart = hasWindow && windowStartMs != null ? formatLocalDateTime(windowStartMs) : ''
			const timeWindowEnd = hasWindow && windowEndMs != null ? formatLocalDateTime(windowEndMs) : ''
			const scheduledTime = !hasWindow && scheduledStartMs != null ? formatLocalDateTime(scheduledStartMs) : ''
			const scheduledEnd = !hasWindow && scheduledStartMs != null ? formatLocalDateTime(scheduledStartMs + totalDurationMinutes * 60000) : ''
			return {
				scheduleMode: mode,
				scheduledTime,
				scheduledEnd,
				durationDays: durDays,
				durationHours: durHours,
				durationMinutes: durMinutes,
				timeWindowStart,
				timeWindowEnd,
				preferredTimes,
				blackoutPeriods: blackoutPeriods,
				dailyConstraints: showAdvanced ? dailyConstraints : [{ start: dailyStartFromMin, end: dailyEndToMin }]
			}
		}
	}))

	const addTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[]) => setter([...ranges, { start: null, end: null }])
	const removeTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[], idx: number) => setter(ranges.filter((_, i) => i !== idx))
	const updateTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[], idx: number, field: 'start' | 'end', value: string) => {
		const parsed = parseDateTime(value)
		const ms = parsed != null ? roundMsTo30Min(parsed) : null
		const curr = ranges[idx]
		let clamped: number | null = ms
		if (ms != null && hasWindow && windowStartMs != null && windowEndMs != null) {
			if (ms < windowStartMs) { clamped = windowStartMs }
			if (ms > windowEndMs) { clamped = windowEndMs }
			if (field === 'end') {
				const startRef = curr.start ?? windowStartMs
				if (clamped !== null && clamped < startRef) { clamped = startRef }
			}
			clamped = roundMsTo30Min(clamped as number)
		}
		const updated = [...ranges]
		updated[idx] = { ...updated[idx], [field]: clamped } as TimeRange
		setter(updated)
	}

	const renderTimeRanges = (label: string, ranges: TimeRange[], setter: (ranges: TimeRange[]) => void) => (
		<div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<h4 className="text-sm font-medium text-gray-700">{label}</h4>
			{ranges.length === 0 && (
				<p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">{'None'}</p>
			)}
			{ranges.map((range, idx) => (
				<div key={idx} className="relative rounded-md border border-gray-200 p-3">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Start'}</label>
							<div className="mt-1 flex gap-2">
								<input
									type="date"
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
									value={range.start != null ? formatLocalDate(range.start) : ''}
									onChange={(e) => {
										const dateStr = e.target.value
										const timeStr = range.start != null ? formatLocalTimeOnly(range.start) : '00:00'
										updateTimeRange(setter, ranges, idx, 'start', dateStr ? `${dateStr}T${timeStr}` : '')
									}}
									aria-label={`${label} start date ${idx + 1}`}
									title="Start date"
									placeholder="YYYY-MM-DD"
								/>
								<select
									className="w-24 sm:w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
									value={range.start != null ? formatLocalTimeOnly(range.start) : ''}
									onChange={(e) => {
										const timeStr = e.target.value
										const existingDateStr = range.start != null ? formatLocalDate(range.start) : ''
										const fallbackDate = windowStartMs != null ? formatLocalDate(windowStartMs) : todayDateStr
										const dateStr = existingDateStr || fallbackDate
										updateTimeRange(setter, ranges, idx, 'start', `${dateStr}T${timeStr}`)
									}}
									aria-label={`${label} start time ${idx + 1}`}
									title="Start time"
								>
									<option value="" disabled hidden>{'--:--'}</option>
									{Array.from({ length: 48 }).map((_, i) => { const m = i * 30; const v = formatTime(m); return (<option key={v} value={v}>{v}</option>) })}
								</select>
							</div>
						</div>
						<div>
							<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'End'}</label>
							<div className="mt-1 flex gap-2">
								<input
									type="date"
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
									value={range.end != null ? formatLocalDate(range.end) : ''}
									onChange={(e) => {
										const dateStr = e.target.value
										const timeStr = range.end != null ? formatLocalTimeOnly(range.end) : '00:00'
										updateTimeRange(setter, ranges, idx, 'end', dateStr ? `${dateStr}T${timeStr}` : '')
									}}
									aria-label={`${label} end date ${idx + 1}`}
									title="End date"
									placeholder="YYYY-MM-DD"
								/>
								<select
									className="w-24 sm:w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
									value={range.end != null ? formatLocalTimeOnly(range.end) : ''}
									onChange={(e) => {
										const timeStr = e.target.value
										const existingEndDate = range.end != null ? formatLocalDate(range.end) : ''
										const startDateStr = range.start != null ? formatLocalDate(range.start) : ''
										const fallbackDate = (windowEndMs ?? windowStartMs) != null ? formatLocalDate((windowEndMs ?? windowStartMs)!) : todayDateStr
										const dateStr = existingEndDate || startDateStr || fallbackDate
										updateTimeRange(setter, ranges, idx, 'end', `${dateStr}T${timeStr}`)
									}}
									aria-label={`${label} end time ${idx + 1}`}
									title="End time"
								>
									<option value="" disabled hidden>{'--:--'}</option>
									{Array.from({ length: 48 }).map((_, i) => { const m = i * 30; const v = formatTime(m); return (<option key={v} value={v}>{v}</option>) })}
								</select>
							</div>
						</div>
					</div>
					<button type="button" onClick={() => removeTimeRange(setter, ranges, idx)} className="absolute top-2 right-2 h-8 w-8 min-w-[2rem] inline-flex items-center justify-center rounded-md border border-amber-200 bg-white text-amber-600 hover:bg-amber-50" aria-label={`Remove ${label.toLowerCase()} ${idx + 1}`}>
						<FaMinus className="text-xs" />
					</button>
				</div>
			))}
			<div className="flex justify-end">
				<button type="button" onClick={() => addTimeRange(setter, ranges)} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700 hover:bg-indigo-100" aria-label={`Add ${label.toLowerCase()}`}>
					<FaPlus /> {'Add'}
				</button>
			</div>
		</div>
	)

	const handleRangeStartChange = (value: string) => {
		// Validate against target date constraint if set
		if (value && targetDate) {
			const valueMs = localDateAt(value)
			const targetMs = localDateAt(targetDate)
			if (!Number.isNaN(valueMs) && !Number.isNaN(targetMs) && valueMs > targetMs) {
				return // Don't set if beyond target date
			}
		}
		setRangeStartDate(value)

		// Auto-set end date if not already set - always +7 days
		if (value && !rangeEndDate) {
			const startMs = localDateAt(value)
			if (!Number.isNaN(startMs)) {
				const autoEndDate = new Date(startMs)
				autoEndDate.setDate(autoEndDate.getDate() + 7)
				setRangeEndDate(formatLocalDate(autoEndDate.getTime()))
			}
		}
	}
	const handleRangeEndChange = (value: string) => {
		// No upper constraint on end date, but ensure it's not before start date
		if (value && rangeStartDate) {
			const valueMs = localDateAt(value)
			const startMs = localDateAt(rangeStartDate)
			if (!Number.isNaN(valueMs) && !Number.isNaN(startMs) && valueMs < startMs) {
				return // Don't set if before start date
			}
		}
		setRangeEndDate(value)

		// Auto-set start date if not already set - always -7 days, capped at today
		if (value && !rangeStartDate) {
			const endMs = localDateAt(value)
			if (!Number.isNaN(endMs)) {
				const autoStartDate = new Date(endMs)
				autoStartDate.setDate(autoStartDate.getDate() - 7)

				const todayMs = localDateAt(todayDateStr)
				const autoStartMs = autoStartDate.getTime()

				// Cap at today's date if calculated start would be before today
				if (autoStartMs < todayMs) {
					setRangeStartDate(todayDateStr)
				} else {
					setRangeStartDate(formatLocalDate(autoStartDate.getTime()))
				}
			}
		}
	}
	const handleTargetDateChange = (value: string) => {
		setTargetDate(value)
	}

	const clearSchedulingWindow = () => {
		setRangeStartDate('')
		setRangeEndDate('')
	}

	const handleRangeDayChange = (type: 'start' | 'end', direction: number) => {
		if (type === 'start') {
			if (!rangeStartDate) { return } // Can't adjust if not set
			// Normal increment/decrement
			const current = localDateAt(rangeStartDate)
			if (Number.isNaN(current)) { return }
			const newDate = new Date(current)
			newDate.setDate(newDate.getDate() + direction)
			setRangeStartDate(formatLocalDate(newDate.getTime()))
		} else {
			if (!rangeEndDate) { return } // Can't adjust if not set
			// Normal increment/decrement
			const current = localDateAt(rangeEndDate)
			if (Number.isNaN(current)) { return }
			const newDate = new Date(current)
			newDate.setDate(newDate.getDate() + direction)
			setRangeEndDate(formatLocalDate(newDate.getTime()))
		}
	}	// Centralized scheduling constraints and validation logic
	const schedulingConstraints = useMemo(() => {
		const startMs = rangeStartDate ? localDateAt(rangeStartDate) : null
		const endMs = rangeEndDate ? localDateAt(rangeEndDate) : null

		// Calculate min/max values first
		const startDateMin = todayDateStr
		const startDateMax = targetDate || rangeEndDate || undefined

		const endDateMinCandidates = [todayDateStr]
		if (rangeStartDate) { endDateMinCandidates.push(rangeStartDate) }
		if (targetDate) { endDateMinCandidates.push(targetDate) }
		const endDateMin = endDateMinCandidates.sort()[endDateMinCandidates.length - 1]
		const endDateMax = undefined // No upper limit for end date

		const targetDateMin = rangeStartDate || todayDateStr
		const targetDateMax = rangeEndDate || undefined

		// Calculate min/max timestamps for button logic
		const startMinMs = localDateAt(startDateMin)
		const startMaxMs = startDateMax != null ? localDateAt(startDateMax) : null
		const endMinMs = localDateAt(endDateMin)

		return {
			// Input min/max values
			startDateMin,
			startDateMax,
			endDateMin,
			endDateMax,
			targetDateMin,
			targetDateMax,

			// Button disable states - now using the same min/max logic
			canDecrementStartDate: Boolean(
				rangeStartDate &&
				startMs != null &&
				startMs > startMinMs
			),
			canIncrementStartDate: Boolean(
				rangeStartDate &&
				startMs != null &&
				(startMaxMs == null || startMs < startMaxMs)
			),
			canDecrementEndDate: Boolean(
				rangeEndDate &&
				endMs != null &&
				endMs > endMinMs
			),
			canIncrementEndDate: Boolean(rangeEndDate)
		}
	}, [targetDate, rangeStartDate, rangeEndDate, todayDateStr])

	// Helper text for Date section
	let dateSectionHelp = 'Pick a date to schedule your event.'
	if (targetDate) {
		if (rangeStartDate || rangeEndDate) {
			dateSectionHelp = 'Preferred date set! RainDate will use your window if this date isn’t available to everyone.'
		} else {
			dateSectionHelp = 'Date set! Your event will be scheduled for this day.'
		}
	} else if (rangeStartDate || rangeEndDate) {
		dateSectionHelp = 'No date set. Add one to prefer a specific date within your window.'
	}

	// Helper text for Window section
	let windowSectionHelp = 'Set a time window to let RainDate find the best slot for everyone.'
	if (rangeStartDate || rangeEndDate) {
		windowSectionHelp = targetDate
			? 'Window set! It will be used only if your preferred date isn’t available to everyone.'
			: 'Window set! RainDate will pick the best time within this range.'
	} else if (targetDate) {
		windowSectionHelp = 'No window set. Add one to ensure everyone can make it to your event.'
	}

	return (
		<Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg shadow-indigo-200/30 scroll-mt-24" id="scheduling-section">
			<CardHeader>
				<CardTitle className="flex items-center gap-3 text-3xl font-bold text-gray-800">
					<FaClock /> <span>{'Scheduling'}</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8 pt-4">
				<div className="space-y-6">
					<div className="space-y-5">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
							<div className="md:col-span-3">
								<h4 className="text-base font-semibold text-gray-700 mb-2">{'Time & Duration'}</h4>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-gray-600" htmlFor="start-time">{'Start Time'}</label>
								<input id="start-time" type="time" value={formatTime(dailyStartFromMin)} onChange={(e) => { setDailyStartFromMin(roundMinutesTo30(parseTime(e.target.value))) }} step={1800} className="mt-1 w-full rounded-lg border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50" />
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-gray-600" htmlFor="end-time">{'End Time'}</label>
								<input id="end-time" type="time" value={formatTime(dailyEndToMin)} onChange={(e) => {
									const newEndTime = roundMinutesTo30(parseTime(e.target.value))
									setDailyEndToMin(newEndTime)
									// If end time is earlier than start time and duration days is 0, set it to 1
									if (newEndTime < dailyStartFromMin && durDays === 0) {
										setDurDays(1)
									}
								}} step={1800} className="mt-1 w-full rounded-lg border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50" />
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-gray-600" htmlFor="dur-days">{'Duration (Days)'}</label>
								<input aria-label="Duration in days" id="dur-days" type="number" min={dailyEndToMin < dailyStartFromMin ? 1 : 0} value={durDays} onChange={(e) => {
									const minValue = dailyEndToMin < dailyStartFromMin ? 1 : 0
									const inputValue = parseInt(e.target.value) || 0
									setDurDays(Math.max(minValue, inputValue))
								}} className="mt-1 w-full rounded-lg border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50" />
							</div>
						</div>

						<div className="border-t border-gray-200/80" />

						<div className="space-y-4">
							<h4 className="text-base font-semibold text-gray-700">{'Date'}</h4>
							{/* Preferred Date */}
							<div className={`p-4 rounded-lg ${targetDate ? 'ring-1 ring-indigo-200' : 'border-gray-200'}`}>
								<div className="flex items-center justify-between mb-2">
									<label className="text-sm font-semibold text-gray-700 tracking-wide" htmlFor="target-date">
										<span className="uppercase mr-1">{'Event Date'}</span>
										<span className="font-normal text-gray-500">{'(Optional)'}</span>
									</label>
									{targetDate && (
										<button type="button" onClick={() => setTargetDate('')} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-700 hover:bg-amber-100" aria-label="Clear date">
											<FaMinus /> {'Clear Date'}
										</button>
									)}
								</div>
								<input
									id="target-date"
									type="date"
									value={targetDate}
									onChange={(e) => handleTargetDateChange(e.target.value)}
									min={schedulingConstraints.targetDateMin}
									max={schedulingConstraints.targetDateMax}
									className="w-full rounded-lg border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
								/>
								<p className="text-sm italic text-gray-700 mt-2">{dateSectionHelp}</p>
							</div>

							{/* Window Definition */}
							<div className={`p-4 rounded-lg ${rangeStartDate || rangeEndDate ? 'ring-1 ring-green-200' : 'border-gray-200'}`}>
								<div className="flex items-center justify-between mb-2">
									<div>
										<h5 className="text-sm font-semibold uppercase tracking-wide text-indigo-800/80">{'Smart Scheduling Window'} <span className="text-xs font-normal normal-case text-indigo-600/80">{'(Recommended)'}</span></h5>
									</div>
									{(rangeStartDate || rangeEndDate) && (
										<button type="button" onClick={clearSchedulingWindow} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-700 hover:bg-amber-100" aria-label="Clear scheduling window">
											<FaMinus /> {'Clear Window'}
										</button>
									)}
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
									<div>
										<label className="block text-xs font-semibold uppercase tracking-wide text-indigo-800/80" htmlFor="range-start-date">{'Earliest Date'}</label>
										<div className="flex items-center gap-1 mt-1">
											<input id="range-start-date" type="date" value={rangeStartDate} onChange={(e) => handleRangeStartChange(e.target.value)} min={schedulingConstraints.startDateMin} max={schedulingConstraints.startDateMax} className="w-full rounded-lg border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50" />
											{rangeStartDate && (
												<>
													<button type="button" onClick={() => handleRangeDayChange('start', -1)} disabled={!schedulingConstraints.canDecrementStartDate} className="h-9 w-9 flex-shrink-0 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Move earliest date back by one day">
														<FaMinus className="text-xs" />
													</button>
													<button type="button" onClick={() => handleRangeDayChange('start', 1)} disabled={!schedulingConstraints.canIncrementStartDate} className="h-9 w-9 flex-shrink-0 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Move earliest date forward by one day">
														<FaPlus className="text-xs" />
													</button>
												</>
											)}
										</div>
										{targetDate && <p className="text-xs text-indigo-700/80 mt-1.5">{`-${flexibilityDaysBefore} days`}</p>}
										{!targetDate && <p className="text-xs mt-1.5" style={{ visibility: 'hidden' }}>{'-'}</p>}
									</div>
									<div>
										<label className="block text-xs font-semibold uppercase tracking-wide text-indigo-800/80" htmlFor="range-end-date">{'Latest Date'}</label>
										<div className="flex items-center gap-1 mt-1">
											<input id="range-end-date" type="date" value={rangeEndDate} onChange={(e) => handleRangeEndChange(e.target.value)} min={schedulingConstraints.endDateMin} max={schedulingConstraints.endDateMax} className="w-full rounded-lg border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50" />
											{rangeEndDate && (
												<>
													<button type="button" onClick={() => handleRangeDayChange('end', -1)} disabled={!schedulingConstraints.canDecrementEndDate} className="h-9 w-9 flex-shrink-0 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Move latest date back by one day">
														<FaMinus className="text-xs" />
													</button>
													<button type="button" onClick={() => handleRangeDayChange('end', 1)} disabled={!schedulingConstraints.canIncrementEndDate} className="h-9 w-9 flex-shrink-0 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Move latest date forward by one day">
														<FaPlus className="text-xs" />
													</button>
												</>
											)}
										</div>
										{targetDate && <p className="text-xs text-indigo-700/80 mt-1.5">{`+${flexibilityDaysAfter} days`}</p>}
										{!targetDate && <p className="text-xs mt-1.5" style={{ visibility: 'hidden' }}>{'+'}</p>}
									</div>
								</div>
								<p className="text-sm italic text-gray-700 mt-2">{windowSectionHelp}</p>
							</div>
						</div>
					</div>

					{(() => {
						const summaryText = humanizeWindow(windowStartMs, windowEndMs, scheduledStartMs, formatTime(dailyStartFromMin), formatTime(dailyEndToMin), totalDurationMinutes)
						return summaryText && (
							<div className="text-center py-3 px-4 rounded-lg bg-gray-100 border border-gray-200/80 shadow-inner">
								<p className="text-sm font-semibold text-gray-800">{'Scheduling Summary'}</p>
								<p className="text-sm font-medium text-gray-700 mt-1">{summaryText}</p>
							</div>
						)
					})()}

					{showTimeline && (
						<div className="space-y-3">
							<h4 className="text-base font-semibold text-gray-700 mb-2">{'Availability Timeline'}</h4>
							<EventTimeline
								windowStart={windowStartMs!}
								windowEnd={windowEndMs!}
								duration={totalDurationMinutes * 60000}
								preferred={[
									...preferredTimes.filter((p): p is ITimeRange => p.start != null && p.end != null),
									...(targetPreferredRange ? [targetPreferredRange] : [])
								]}
								blackout={blackoutPeriods.filter((b): b is ITimeRange => b.start != null && b.end != null)}
								scheduledTime={undefined}
							/>
						</div>
					)}

					{hasWindow && (
						<div className="border-t border-gray-200 pt-6 space-y-4">
							<div className="flex justify-between items-center">
								<h3 className="text-base font-semibold text-gray-700">{'Advanced Options'}</h3>
								<button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
									{showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
								</button>
							</div>
							{showAdvanced && (
								<div className="space-y-6 animate-fade-in">
									{renderTimeRanges('Preferred Times', preferredTimes, setPreferredTimes)}
									{renderTimeRanges('Blackout Periods', blackoutPeriods, setBlackoutPeriods)}
								</div>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
})

Scheduling.displayName = 'Scheduling'
export default Scheduling