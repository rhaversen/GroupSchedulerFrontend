'use client'

import { forwardRef, useImperativeHandle, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { FaClock, FaPlus, FaMinus, FaSlidersH } from 'react-icons/fa'

import EventTimeline from '@/components/EventTimeline'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { type ITimeRange } from '@/types/backendDataTypes'
import { type DailyConstraint, type TimeRange, type ScheduleMode } from '@/types/newEvent'

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
function humanizeWindow (startMs?: number | null, endMs?: number | null, scheduledMs?: number | null, startLabel?: string, endLabel?: string) {
	const now = Date.now()
	if (scheduledMs != null) {
		const diffDays = Math.round((scheduledMs - now) / (24 * 60 * 60 * 1000))
		const when = diffDays <= 0 ? 'soon' : diffDays === 1 ? 'tomorrow' : diffDays < 14 ? `in ${diffDays} days` : `in about ${Math.round(diffDays / 7)} weeks`
		return `Scheduled for ${shortDate(scheduledMs)} ${startLabel ?? new Date(scheduledMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${when})`
	}
	if (startMs != null && endMs != null) {
		const from = shortDate(startMs)
		const to = shortDate(endMs)
		const d1 = Math.max(0, Math.round((startMs - now) / (24 * 60 * 60 * 1000)))
		const d2 = Math.max(0, Math.round((endMs - now) / (24 * 60 * 60 * 1000)))
		const span = d2 <= d1 ? '' : d2 - d1 < 14 ? ` (~${d1}–${d2} days from now)` : ` (~${Math.round(d1 / 7)}–${Math.round(d2 / 7)} weeks from now)`
		return `Anytime between ${from} and ${to}${span}${(startLabel != null) && (endLabel != null) ? `, starting between ${startLabel} and ${endLabel}` : ''}`
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
	// Core time-of-day
	const [dailyStartFromMin, setDailyStartFromMin] = useState(9 * 60)
	const [dailyEndToMin, setDailyEndToMin] = useState(17 * 60)

	// Conventional from/to dates
	const [anchorDate, setAnchorDate] = useState('')
	const [toDate, setToDate] = useState('')

	// Time window
	const [rangeStartDate, setRangeStartDate] = useState('')
	const [rangeEndDate, setRangeEndDate] = useState('')

	// Constraints
	const [preferredTimes, setPreferredTimes] = useState<TimeRange[]>([])
	const [blackoutPeriods, setBlackoutPeriods] = useState<TimeRange[]>([])
	const [dailyConstraints, setDailyConstraints] = useState<DailyConstraint[]>([])
	const [allowedWeekdays, setAllowedWeekdays] = useState<boolean[]>([true, true, true, true, true, true, true])
	const [showAdvanced, setShowAdvanced] = useState(false)

	const initializedRef = useRef(false)
	const todayDateStr = useMemo(() => formatLocalDate(Date.now()), [])

	// Duration controls (explicit)
	const [durDays, setDurDays] = useState(0)
	const [durHours, setDurHours] = useState(1)
	const [durMinutes, setDurMinutes] = useState(0)
	const totalDurationMinutes = useMemo(() => (durDays * 24 * 60) + (durHours * 60) + durMinutes, [durDays, durHours, durMinutes])
	const lastEditedRef = useRef<'start' | 'end' | 'duration' | null>(null)
	const initSyncedRef = useRef(false)

	// Initial sync for end time/date from start + duration
	useEffect(() => {
		if (initSyncedRef.current) { return }
		const mod = totalDurationMinutes % (24 * 60)
		const nextEnd = (dailyStartFromMin + mod) % (24 * 60)
		if (nextEnd !== dailyEndToMin) { setDailyEndToMin(nextEnd) }
		if (anchorDate) {
			const s = localDateAt(anchorDate, Math.floor(dailyStartFromMin / 60), dailyStartFromMin % 60)
			const e = s + totalDurationMinutes * 60000
			if (!Number.isNaN(s)) { setToDate(formatLocalDate(e)) }
		}
		initSyncedRef.current = true
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Update end time/date when start or duration edited
	useEffect(() => {
		if (lastEditedRef.current === 'start' || lastEditedRef.current === 'duration') {
			const mod = totalDurationMinutes % (24 * 60)
			const nextEnd = (dailyStartFromMin + mod) % (24 * 60)
			if (nextEnd !== dailyEndToMin) { setDailyEndToMin(nextEnd) }
			if (anchorDate) {
				const s = localDateAt(anchorDate, Math.floor(dailyStartFromMin / 60), dailyStartFromMin % 60)
				const e = s + totalDurationMinutes * 60000
				if (!Number.isNaN(s)) { setToDate(formatLocalDate(e)) }
			}
			lastEditedRef.current = null
		}
	}, [dailyStartFromMin, totalDurationMinutes, dailyEndToMin, anchorDate])

	// Update duration when end edited
	useEffect(() => {
		if (lastEditedRef.current === 'end') {
			if (anchorDate && toDate) {
				const s = localDateAt(anchorDate, Math.floor(dailyStartFromMin / 60), dailyStartFromMin % 60)
				const e = localDateAt(toDate, Math.floor(dailyEndToMin / 60), dailyEndToMin % 60)
				if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) {
					const diffMin = Math.max(0, Math.floor((e - s) / 60000))
					const d = Math.floor(diffMin / (24 * 60))
					const r = diffMin % (24 * 60)
					const h = Math.floor(r / 60)
					const m = r % 60
					setDurDays(d)
					setDurHours(h)
					setDurMinutes(m)
				}
			} else {
				const delta = (dailyEndToMin - dailyStartFromMin + 24 * 60) % (24 * 60)
				setDurHours(Math.floor(delta / 60))
				setDurMinutes(delta % 60)
			}
			lastEditedRef.current = null
		}
	}, [dailyEndToMin, dailyStartFromMin, anchorDate, toDate])

	// Initialize defaults once
	useEffect(() => {
		if (initializedRef.current) { return }
		if (dailyConstraints.length === 0) { setDailyConstraints([{ start: 8 * 60, end: 20 * 60 }]) }
		initializedRef.current = true
	}, [dailyConstraints.length])

	// Derived window from optional range dates; if one side missing, default to 7 days span
	const defaultSpanDays = 7
	const windowStartMs = useMemo(() => {
		if (rangeStartDate) { return roundMsTo30Min(localDateAt(rangeStartDate, 0, 0)) }
		if (rangeEndDate) { return roundMsTo30Min(localDateAt(rangeEndDate, 0, 0) - defaultSpanDays * 24 * 60 * 60 * 1000) }
		return null
	}, [rangeStartDate, rangeEndDate])
	const windowEndMs = useMemo(() => {
		if (rangeEndDate) { return roundMsTo30Min(localDateAt(rangeEndDate, 23, 30)) }
		if (rangeStartDate) { return roundMsTo30Min(localDateAt(rangeStartDate, 23, 30) + defaultSpanDays * 24 * 60 * 60 * 1000) }
		return null
	}, [rangeStartDate, rangeEndDate])

	// Derived fixed schedule when no window and anchor is set
	const scheduledStartMs = useMemo(() => {
		if (!anchorDate) { return null }
		const ms = localDateAt(anchorDate, Math.floor(dailyStartFromMin / 60), dailyStartFromMin % 60)
		return Number.isNaN(ms) ? null : roundMsTo30Min(ms)
	}, [anchorDate, dailyStartFromMin])

	const scheduledEndMs = useMemo(() => {
		if (anchorDate && toDate) {
			const endMs = localDateAt(toDate, Math.floor(dailyEndToMin / 60), dailyEndToMin % 60)
			return Number.isNaN(endMs) ? null : roundMsTo30Min(endMs)
		}
		if (scheduledStartMs == null) { return null }
		return roundMsTo30Min(scheduledStartMs + totalDurationMinutes * 60000)
	}, [anchorDate, toDate, dailyEndToMin, scheduledStartMs, totalDurationMinutes])

	const hasWindow = useMemo(() => Boolean(rangeStartDate || rangeEndDate), [rangeStartDate, rangeEndDate])
	const showTimeline = hasWindow && windowStartMs != null && windowEndMs != null
	const showFixedDetails = !hasWindow && Boolean(anchorDate)

	// Weekday-derived blackout over current window
	const [derivedBlackouts, setDerivedBlackouts] = useState<TimeRange[]>([])
	useEffect(() => {
		if (!hasWindow || windowStartMs == null || windowEndMs == null) { setDerivedBlackouts([]); return }
		const ws = windowStartMs, we = windowEndMs
		const out: TimeRange[] = []
		const dayMs = 24 * 60 * 60 * 1000
		const startDay = new Date(new Date(ws).toDateString()).getTime()
		const endDay = new Date(new Date(we).toDateString()).getTime()
		for (let t = startDay; t <= endDay; t += dayMs) {
			const weekday = new Date(t).getDay()
			if (!allowedWeekdays[weekday]) {
				const dayStart = Math.max(ws, t)
				const dayEnd = Math.min(we, t + dayMs)
				if (dayEnd > dayStart) { out.push({ start: dayStart, end: dayEnd }) }
			}
		}
		setDerivedBlackouts(out)
	}, [allowedWeekdays, hasWindow, windowStartMs, windowEndMs])

	// Preferred time derived from preferred date
	const anchorPreferredRange = useMemo<ITimeRange | null>(() => {
		if (!anchorDate) { return null }
		const s = roundMsTo30Min(localDateAt(anchorDate, Math.floor(dailyStartFromMin / 60), dailyStartFromMin % 60))
		const e = scheduledEndMs ?? (s + totalDurationMinutes * 60000)
		return { start: s, end: e }
	}, [anchorDate, dailyStartFromMin, scheduledEndMs, totalDurationMinutes])

	// Expose data
	useImperativeHandle(ref, () => ({
		getFormData: () => {
			const mode: ScheduleMode = hasWindow ? 'dynamic' : 'fixed'
			const timeWindowStart = hasWindow && windowStartMs != null ? formatLocalDateTime(windowStartMs) : ''
			const timeWindowEnd = hasWindow && windowEndMs != null ? formatLocalDateTime(windowEndMs) : ''
			const scheduledTime = !hasWindow && scheduledStartMs != null ? formatLocalDateTime(scheduledStartMs) : ''
			const scheduledEnd = !hasWindow && scheduledEndMs != null ? formatLocalDateTime(scheduledEndMs) : ''
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
				blackoutPeriods: [...blackoutPeriods, ...derivedBlackouts],
				dailyConstraints: showAdvanced ? dailyConstraints : [{ start: dailyStartFromMin, end: dailyEndToMin }]
			}
		}
	}))

	const toggleWeekday = (idx: number) => setAllowedWeekdays(prev => prev.map((v, i) => (i === idx ? !v : v)))
	const setPresetWeekdays = (preset: 'all' | 'weekends' | 'weekdays' | 'fri') => {
		if (preset === 'all') { setAllowedWeekdays([true, true, true, true, true, true, true]) }
		if (preset === 'weekends') { setAllowedWeekdays([true, false, false, false, false, false, true]) }
		if (preset === 'weekdays') { setAllowedWeekdays([false, true, true, true, true, true, false]) }
		if (preset === 'fri') { setAllowedWeekdays([false, false, false, false, true, false, false]) }
	}

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

	const handleRangeStartChange = useCallback((value: string) => { setRangeStartDate(value) }, [])
	const handleRangeEndChange = useCallback((value: string) => { setRangeEndDate(value) }, [])
	const handleAnchorDateChange = useCallback((value: string) => {
		lastEditedRef.current = 'start'
		setAnchorDate(value)
	}, [])

	return (
		<Card className="border-0 shadow-md scroll-mt-24 ring-1 ring-indigo-200/60" id="scheduling-section">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FaClock /> {'When should this happen?'}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="space-y-6">
					<div className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm space-y-4">
						<h4 className="text-sm font-medium text-gray-800">{'Event schedule'}</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* From */}
							<div className="space-y-2">
								<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'From'}</label>
								<div className="flex gap-2">
									<input
										type="date"
										min={formatLocalDate(Date.now())}
										value={anchorDate}
										onChange={(e) => handleAnchorDateChange(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
										title="Start date"
										placeholder="YYYY-MM-DD"
										aria-label="Start date"
									/>
									<input
										type="time"
										step={1800}
										value={formatTime(dailyStartFromMin)}
										onChange={(e) => { lastEditedRef.current = 'start'; const m = roundMinutesTo30(parseTime(e.target.value)); setDailyStartFromMin(m) }}
										className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
										title="Start time"
										aria-label="Start time"
									/>
								</div>
							</div>
							{/* To */}
							<div className="space-y-2">
								<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'To'}</label>
								<div className="flex gap-2">
									<input
										type="date"
										min={anchorDate || undefined}
										value={toDate}
										onChange={(e) => { lastEditedRef.current = 'end'; setToDate(e.target.value) }}
										className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
										title="End date"
										placeholder="YYYY-MM-DD"
										aria-label="End date"
									/>
									<input
										type="time"
										step={1800}
										value={formatTime(dailyEndToMin)}
										onChange={(e) => { lastEditedRef.current = 'end'; const m = roundMinutesTo30(parseTime(e.target.value)); setDailyEndToMin(m) }}
										className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
										title="End time"
										aria-label="End time"
									/>
								</div>
							</div>
						</div>

						<div className="flex flex-wrap items-end gap-4">
							<div className="flex items-end gap-2">
								<div className="flex flex-col">
									<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Duration (d:h:m)'}</label>
									<div className="mt-1 flex items-center gap-2">
										<input
											type="number"
											min={0}
											max={365}
											value={durDays}
											onChange={(e) => { lastEditedRef.current = 'duration'; setDurDays(Math.max(0, parseInt(e.target.value) || 0)) }}
											className="w-20 h-10 rounded-lg border border-gray-300 px-2 text-sm"
											title="Duration days"
											aria-label="Duration days"
										/>
										<input
											type="number"
											min={0}
											max={23}
											value={durHours}
											onChange={(e) => { lastEditedRef.current = 'duration'; setDurHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0))) }}
											className="w-16 h-10 rounded-lg border border-gray-300 px-2 text-sm"
											title="Duration hours"
											aria-label="Duration hours"
										/>
										<input
											type="number"
											min={0}
											max={59}
											value={durMinutes}
											onChange={(e) => { lastEditedRef.current = 'duration'; setDurMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0))) }}
											className="w-16 h-10 rounded-lg border border-gray-300 px-2 text-sm"
											title="Duration minutes"
											aria-label="Duration minutes"
										/>
									</div>
								</div>
								<div className="text-sm text-gray-600 ml-2">
									{`= ${durDays}d ${durHours}h ${durMinutes}m`}
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Window start (optional)'}</label>
									<input
										type="date"
										value={rangeStartDate}
										onChange={(e) => handleRangeStartChange(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
										title="Window start date"
										placeholder="YYYY-MM-DD"
										aria-label="Window start date"
									/>
									<div className="flex flex-wrap items-center gap-2">
										{[-10, -5, -2, -1].map((d) => (
											<button key={d} type="button" disabled={!anchorDate} onClick={() => { if (!anchorDate) { return } const base = localDateAt(anchorDate, 0, 0); const s = new Date(base); s.setDate(s.getDate() + d); setRangeStartDate(formatLocalDate(s.getTime())) }} className={`px-2 py-1 text-xs rounded-md border ${anchorDate ? 'border-gray-300 bg-white hover:bg-gray-50' : 'border-gray-200 bg-gray-100 text-gray-400'}`}>{d}</button>
										))}
									</div>
								</div>
								<div className="space-y-2">
									<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Window end (optional)'}</label>
									<input
										type="date"
										value={rangeEndDate}
										onChange={(e) => handleRangeEndChange(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
										title="Window end date"
										placeholder="YYYY-MM-DD"
										aria-label="Window end date"
									/>
									<div className="flex flex-wrap items-center gap-2">
										{[+1, +2, +5, +10].map((d) => (
											<button key={d} type="button" disabled={!anchorDate} onClick={() => { if (!anchorDate) { return } const base = localDateAt(anchorDate, 0, 0); const e = new Date(base); e.setDate(e.getDate() + d); setRangeEndDate(formatLocalDate(e.getTime())) }} className={`px-2 py-1 text-xs rounded-md border ${anchorDate ? 'border-gray-300 bg-white hover:bg-gray-50' : 'border-gray-200 bg-gray-100 text-gray-400'}`}>{`+${d}`}</button>
										))}
									</div>
								</div>
							</div>

							{hasWindow && (
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Days of week'}</label>
									<div className="mt-1 flex flex-wrap gap-2">
										{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
											const weekdayIndex = (i + 1) % 7
											return (
												<button key={d} type="button" onClick={() => toggleWeekday(weekdayIndex)} className={`px-2.5 py-1.5 text-xs rounded-md border ${allowedWeekdays[weekdayIndex] ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-300 bg-white text-gray-700'}`}>{d}</button>
											)
										})}
										<div className="ml-2 flex items-center gap-2">
											<button type="button" onClick={() => setPresetWeekdays('all')} className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-700">{'All'}</button>
											<button type="button" onClick={() => setPresetWeekdays('weekends')} className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-700">{'Weekends'}</button>
											<button type="button" onClick={() => setPresetWeekdays('weekdays')} className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-700">{'Weekdays'}</button>
											<button type="button" onClick={() => setPresetWeekdays('fri')} className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-700">{'Fri only'}</button>
										</div>
									</div>
								</div>
							)}

							<div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
								{(() => {
									const startLabel = formatTime(dailyStartFromMin)
									const endLabel = formatTime(dailyEndToMin)
									if (!hasWindow && scheduledStartMs != null && scheduledEndMs != null) {
										return humanizeWindow(null, null, scheduledStartMs, startLabel, endLabel).replace('Scheduled for', `Scheduled for ${startLabel}–${endLabel} on`)
									}
									return humanizeWindow(windowStartMs, windowEndMs, null, startLabel, endLabel) || 'Set a window or dates to see a summary.'
								})()}
							</div>
						</div>
					</div>

					{showTimeline ? (
						<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
							<h4 className="text-sm font-medium text-gray-700 mb-3">{'Timeline preview'}</h4>
							<EventTimeline
								windowStart={windowStartMs!}
								windowEnd={windowEndMs!}
								duration={totalDurationMinutes * 60000}
								preferred={[
									...preferredTimes.filter((p): p is ITimeRange => p.start != null && p.end != null),
									...(anchorPreferredRange ? [anchorPreferredRange] : [])
								]}
								blackout={[...derivedBlackouts, ...blackoutPeriods].filter((b): b is ITimeRange => b.start != null && b.end != null)}
								scheduledTime={undefined}
							/>
						</div>
					) : (
						<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
							<h4 className="text-sm font-medium text-gray-700 mb-3">{'Event details'}</h4>
							<div className="space-y-3">
								{showFixedDetails ? (
									<div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
										<FaClock className="text-indigo-600" />
										<div>
											<div className="font-medium text-indigo-900">
												{formatTime(dailyStartFromMin)}{' – '}{formatTime(dailyEndToMin)}
											</div>
											<div className="text-sm text-indigo-700">
												{new Date(anchorDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}{toDate ? ` → ${new Date(toDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
											</div>
										</div>
									</div>
								) : (
									<div className="text-center text-gray-500 py-8">
										{'Set start date/time to see details'}
									</div>
								)}
							</div>
						</div>
					)}

					{hasWindow && (
						<div className="border-t border-gray-200 pt-4">
							<div className="text-center">
								<button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30">
									<FaSlidersH className="text-xs" /> {showAdvanced ? 'Hide fine‑tune options' : 'Fine‑tune availability'}
								</button>
								<p className="mt-2 text-xs text-gray-500">{'Add preferred and excluded times to nudge '}<span className="text-yellow-500 font-semibold">{'RainDate'}</span>{' towards your ideal schedule.'}</p>
							</div>
							{showAdvanced && (
								<div className="mt-4 space-y-6">
									{anchorPreferredRange && (
										<div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
											<strong>{new Date(anchorPreferredRange.start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
											{' → '}
											<strong>{new Date(anchorPreferredRange.end).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
										</div>
									)}
									{renderTimeRanges('Preferred times', preferredTimes, setPreferredTimes)}
									{renderTimeRanges('Excluded times', blackoutPeriods, setBlackoutPeriods)}
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