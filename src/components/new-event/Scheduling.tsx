'use client'

import { forwardRef, useImperativeHandle, useEffect, useMemo, useRef, useState } from 'react'
import { FaClock, FaPlus, FaMinus, FaBolt, FaSlidersH } from 'react-icons/fa'

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
function combineLocal (dateStr: string, timeStr: string): number | null { if (!dateStr || !timeStr) { return null } const ms = new Date(`${dateStr}T${timeStr}`).getTime(); return Number.isNaN(ms) ? null : ms }
function getDatePart (v: string): string { return v ? v.split('T')[0] : '' }
function getTimePart (v: string): string { return v ? v.split('T')[1] : '' }

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
	// All form state moved here
	const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('dynamic')
	const [scheduledTime, setScheduledTime] = useState('')
	const [scheduledEnd, setScheduledEnd] = useState('')
	const [dynDurationDays, setDynDurationDays] = useState(0)
	const [dynDurationHours, setDynDurationHours] = useState(1)
	const [dynDurationMinutes, setDynDurationMinutes] = useState(0)
	const [fixDurationDays, setFixDurationDays] = useState(0)
	const [fixDurationHours, setFixDurationHours] = useState(1)
	const [fixDurationMinutes, setFixDurationMinutes] = useState(0)
	const [timeWindowStart, setTimeWindowStart] = useState('')
	const [timeWindowEnd, setTimeWindowEnd] = useState('')
	const [preferredTimes, setPreferredTimes] = useState<TimeRange[]>([])
	const [blackoutPeriods, setBlackoutPeriods] = useState<TimeRange[]>([])
	const [dailyConstraints, setDailyConstraints] = useState<DailyConstraint[]>([])
	const [showAdvanced, setShowAdvanced] = useState(false)

	const prevModeRef = useRef<ScheduleMode>(scheduleMode)
	const totalDynamicDurationMinutes = (dynDurationDays * 24 * 60) + (dynDurationHours * 60) + dynDurationMinutes
	const totalFixedDurationMinutes = (fixDurationDays * 24 * 60) + (fixDurationHours * 60) + fixDurationMinutes
	const prevFixedDurationRef = useRef<number>(totalFixedDurationMinutes)
	const initializedRef = useRef(false)

	useImperativeHandle(ref, () => ({
		getFormData: () => {
			const useDyn = scheduleMode === 'dynamic'
			return {
				scheduleMode,
				scheduledTime,
				scheduledEnd,
				durationDays: useDyn ? dynDurationDays : fixDurationDays,
				durationHours: useDyn ? dynDurationHours : fixDurationHours,
				durationMinutes: useDyn ? dynDurationMinutes : fixDurationMinutes,
				timeWindowStart,
				timeWindowEnd,
				preferredTimes,
				blackoutPeriods,
				dailyConstraints
			}
		}
	}))

	useEffect(() => {
		if (initializedRef.current) { return }
		const now = Date.now()
		const startDefault = roundMsTo30Min(now + 60 * 60000)
		const endWindowDefault = roundMsTo30Min(now + (14 * 24 * 60 + 60) * 60000)
		const fixedEndDefault = roundMsTo30Min(now + 5 * 60 * 60000)
		if (!timeWindowStart) { setTimeWindowStart(formatLocalDateTime(startDefault)) }
		if (!timeWindowEnd) { setTimeWindowEnd(formatLocalDateTime(endWindowDefault)) }
		if (!scheduledTime) { setScheduledTime(formatLocalDateTime(startDefault)) }
		if (!scheduledEnd) { setScheduledEnd(formatLocalDateTime(fixedEndDefault)) }
		if (dailyConstraints.length === 0) { setDailyConstraints([{ start: 8 * 60, end: 20 * 60 }]) }
		initializedRef.current = true
	}, [timeWindowStart, timeWindowEnd, scheduledTime, scheduledEnd, dailyConstraints.length, setTimeWindowStart, setTimeWindowEnd, setScheduledTime, setScheduledEnd, setDailyConstraints])

	// Fixed mode: update end only when fixed duration changes, or initializing on entering fixed with no valid end.
	useEffect(() => {
		const modeChangedToFixed = prevModeRef.current !== 'fixed' && scheduleMode === 'fixed'
		const durationChanged = prevFixedDurationRef.current !== totalFixedDurationMinutes

		if (scheduleMode === 'fixed') {
			const start = parseDateTime(scheduledTime)
			const currentEnd = scheduledEnd ? parseDateTime(scheduledEnd) : null

			if (start != null) {
				if (durationChanged && totalFixedDurationMinutes > 0) {
					const targetEnd = roundMsTo30Min(start + totalFixedDurationMinutes * 60000)
					const endStr = formatLocalDateTime(targetEnd)
					if (scheduledEnd !== endStr) { setScheduledEnd(endStr) }
				} else if (modeChangedToFixed && (currentEnd == null || currentEnd <= start) && totalFixedDurationMinutes === 0) {
					const targetEnd = roundMsTo30Min(start + 60 * 60000)
					const endStr = formatLocalDateTime(targetEnd)
					if (scheduledEnd !== endStr) { setScheduledEnd(endStr) }
				}
			}
		}

		prevFixedDurationRef.current = totalFixedDurationMinutes
		prevModeRef.current = scheduleMode
	}, [scheduleMode, scheduledTime, scheduledEnd, totalFixedDurationMinutes, setScheduledEnd])

	// Keep fixed duration in sync when user edits the fixed end directly.
	useEffect(() => {
		if (scheduleMode !== 'fixed') { return }
		const s = parseDateTime(scheduledTime)
		const e = parseDateTime(scheduledEnd)
		if (s == null || e == null) { return }
		const diffMin = Math.max(0, Math.floor((e - s) / 60000))
		const newDays = Math.floor(diffMin / (24 * 60))
		const rem = diffMin % (24 * 60)
		const newHours = Math.floor(rem / 60)
		const newMinutes = rem % 60
		if (newDays !== fixDurationDays) { setFixDurationDays(newDays) }
		if (newHours !== fixDurationHours) { setFixDurationHours(newHours) }
		if (newMinutes !== fixDurationMinutes) { setFixDurationMinutes(newMinutes) }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scheduleMode, scheduledTime, scheduledEnd])

	// const nowLocal = useMemo(() => formatLocalDateTime(Date.now()), [])
	const todayDateStr = useMemo(() => formatLocalDate(Date.now()), [])
	const startMs = useMemo(() => parseDateTime(timeWindowStart), [timeWindowStart])
	const endMs = useMemo(() => parseDateTime(timeWindowEnd), [timeWindowEnd])
	// const minEndLocal = useMemo(() => formatLocalDateTime(Math.max(Date.now(), startMs ?? 0)), [startMs])
	const showTimeline = Boolean(startMs != null && endMs != null && endMs > startMs && totalDynamicDurationMinutes > 0)
	// Half-hour values are generated inline where needed

	const addTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[]) => setter([...ranges, { start: null, end: null }])
	const removeTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[], idx: number) => setter(ranges.filter((_, i) => i !== idx))
	const updateTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[], idx: number, field: 'start' | 'end', value: string) => {
		const parsed = parseDateTime(value)
		const ms = parsed != null ? roundMsTo30Min(parsed) : null
		const windowStart = parseDateTime(timeWindowStart)
		const windowEnd = parseDateTime(timeWindowEnd)
		const curr = ranges[idx]
		let clamped: number | null = ms
		if (ms != null) {
			// Clamp to window
			if (windowStart != null && ms < windowStart) { clamped = windowStart }
			if (windowEnd != null && ms > windowEnd) { clamped = windowEnd }
			// For end, ensure it is >= max(range.start, windowStart)
			if (field === 'end') {
				const startRef = curr.start ?? windowStart ?? null
				const minEnd = startRef != null && windowStart != null ? Math.max(startRef, windowStart) : (startRef ?? windowStart ?? null)
				if (minEnd != null && clamped != null && clamped < minEnd) { clamped = minEnd }
			}
			// Snap final value to 30-min grid after clamping
			clamped = roundMsTo30Min(clamped as number)
		}
		const updated = [...ranges]
		updated[idx] = { ...updated[idx], [field]: clamped } as TimeRange
		setter(updated)
	}

	const addDailyConstraint = () => setDailyConstraints([...dailyConstraints, { start: 9 * 60 }])
	const removeDailyConstraint = (index: number) => setDailyConstraints(dailyConstraints.filter((_, i) => i !== index))
	const updateDailyConstraint = (index: number, key: 'start' | 'end', value: number) => {
		const updated = [...dailyConstraints]
		const curr = updated[index]
		updated[index] = { ...curr, [key]: value }
		setDailyConstraints(updated)
	}
	const toggleDailyConstraintEndTime = (index: number) => {
		const updated = [...dailyConstraints]
		const curr = updated[index]
		updated[index] = curr.end !== undefined ? { start: curr.start } : { ...curr, end: curr.start + (8 * 60) }
		setDailyConstraints(updated)
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
								/>
								<select
									className="w-24 sm:w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
									value={range.start != null ? formatLocalTimeOnly(range.start) : ''}
									onChange={(e) => {
										const timeStr = e.target.value
										const existingDateStr = range.start != null ? formatLocalDate(range.start) : ''
										const fallbackDate = getDatePart(timeWindowStart) || todayDateStr
										const dateStr = existingDateStr || fallbackDate
										updateTimeRange(setter, ranges, idx, 'start', `${dateStr}T${timeStr}`)
									}}
									aria-label={`${label} start time ${idx + 1}`}
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
								/>
								<select
									className="w-24 sm:w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
									value={range.end != null ? formatLocalTimeOnly(range.end) : ''}
									onChange={(e) => {
										const timeStr = e.target.value
										const existingEndDate = range.end != null ? formatLocalDate(range.end) : ''
										const startDate = range.start != null ? formatLocalDate(range.start) : ''
										const fallbackDate = getDatePart(timeWindowEnd) || getDatePart(timeWindowStart) || todayDateStr
										const dateStr = existingEndDate || startDate || fallbackDate
										updateTimeRange(setter, ranges, idx, 'end', `${dateStr}T${timeStr}`)
									}}
									aria-label={`${label} end time ${idx + 1}`}
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
	const DynamicSection = () => (
		<div className="space-y-6">
			<div className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm space-y-4">
				<h4 className="text-sm font-medium text-gray-800">{'Scheduling Window'}</h4>
				<div className="grid sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Earliest start'}</label>
						<div className="mt-1 flex gap-2">
							<input id="time-window-start-date" type="date" value={getDatePart(timeWindowStart)} onChange={(e) => { const dateStr = e.target.value; const timeStr = getTimePart(timeWindowStart) || '00:00'; const ms = combineLocal(dateStr, timeStr); setTimeWindowStart(ms != null ? formatLocalDateTime(roundMsTo30Min(ms)) : '') }} min={todayDateStr} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Window start date" />
							<select id="time-window-start-time" value={getTimePart(timeWindowStart)} onChange={(e) => { const timeStr = e.target.value; const existingDate = getDatePart(timeWindowStart); const dateStr = existingDate || todayDateStr; const ms = combineLocal(dateStr, timeStr); setTimeWindowStart(ms != null ? formatLocalDateTime(roundMsTo30Min(ms)) : '') }} className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Window start time">
								<option value="" disabled hidden>{'--:--'}</option>
								{Array.from({ length: 48 }).map((_, i) => { const m = i * 30; const v = formatTime(m); return (<option key={v} value={v}>{v}</option>) })}
							</select>
						</div>
					</div>
					<div>
						<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Latest end'}</label>
						<div className="mt-1 flex gap-2">
							<input id="time-window-end-date" type="date" value={getDatePart(timeWindowEnd)} onChange={(e) => { const dateStr = e.target.value; const timeStr = getTimePart(timeWindowEnd) || '00:00'; const ms = combineLocal(dateStr, timeStr); setTimeWindowEnd(ms != null ? formatLocalDateTime(roundMsTo30Min(ms)) : '') }} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Window end date" />
							<select id="time-window-end-time" value={getTimePart(timeWindowEnd)} onChange={(e) => { const timeStr = e.target.value; const existingEnd = getDatePart(timeWindowEnd); const startDate = getDatePart(timeWindowStart); const dateStr = existingEnd || startDate || todayDateStr; const ms = combineLocal(dateStr, timeStr); setTimeWindowEnd(ms != null ? formatLocalDateTime(roundMsTo30Min(ms)) : '') }} className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Window end time">
								<option value="" disabled hidden>{'--:--'}</option>
								{Array.from({ length: 48 }).map((_, i) => { const m = i * 30; const v = formatTime(m); return (<option key={v} value={v}>{v}</option>) })}
							</select>
						</div>
					</div>
				</div>
				<div>
					<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Event duration'}</label>
					<div className="mt-1 flex items-end gap-4">
						<div className="flex flex-col w-20">
							<input
								id="duration-days"
								type="number"
								value={dynDurationDays}
								onChange={(e) => setDynDurationDays(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
								min={0}
								max={30}
								className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
								aria-label="Duration in days"
							/>
							<span className="mt-1 text-xs uppercase tracking-wide text-gray-400">{'Days'}</span>
						</div>
						<div className="flex flex-col">
							<select
								value={formatTime(dynDurationHours * 60 + dynDurationMinutes)}
								onChange={(e) => { const totalMins = parseTime(e.target.value); setDynDurationHours(Math.floor(totalMins / 60)); setDynDurationMinutes(totalMins % 60) }}
								className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
								aria-label="Duration in hours and minutes"
							>
								{Array.from({ length: 48 }).map((_, i) => { const total = i * 30; const h = Math.floor(total / 60); const m = total % 60; const v = formatTime(total); const label = `${h} h, ${m} m`; return (<option key={v} value={v}>{label}</option>) })}
							</select>
							<span className="mt-1 text-xs uppercase tracking-wide text-gray-400">{'HH, MM'}</span>
						</div>
					</div>
					<p className="mt-2 text-sm text-gray-700">{'Within this window, '}<span className="text-yellow-500 font-semibold">{'RainDate'}</span>{' automatically picks a start time where the most people can participate. Bigger windows improve the chances that all your guests can make it.'}</p>
					<p className="mt-2 text-sm text-gray-700">{'Set the earliest start a couple of days from now to give people time to prepare.'}</p>
					<p className="mt-2 text-sm text-gray-700">{'If you want to set a specific start time, switch to the '}<span className="text-indigo-500 font-semibold">{'Fixed Date and Time'}</span>{' mode.'}</p>
				</div>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
				<h4 className="text-sm font-medium text-gray-800">{'Daily Start'}</h4>
				<p className="text-sm text-gray-700">{'Control the times of day the event is allowed to start. Use a single time to require a specific start, or a window to allow starts between two times.'}</p>
				{dailyConstraints.length === 0 && (
					<p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600">{'No daily rules set — the event may be scheduled at any time of day, which might not match your preference.'}</p>
				)}
				{dailyConstraints.map((constraint, idx) => (
					<div key={idx} className="flex flex-nowrap items-end gap-2">
						<div className="flex flex-col">
							<label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">{'Start'}</label>
							<input type="time" step={1800} value={formatTime(constraint.start)} onChange={(e) => updateDailyConstraint(idx, 'start', roundMinutesTo30(parseTime(e.target.value)))} className="mt-1 w-36 h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label={`Daily start time ${idx + 1}`} />
						</div>
						<div className="flex flex-col">
							<label className="block text-xs font-semibold uppercase tracking-wide text-gray-700">{'End'}</label>
							{constraint.end !== undefined ? (
								<div className="mt-1 flex">
									<input type="time" step={1800} value={formatTime(constraint.end)} onChange={(e) => updateDailyConstraint(idx, 'end', roundMinutesTo30(parseTime(e.target.value)))} className="w-36 h-10 rounded-l-lg rounded-r-none border border-gray-300 border-r-0 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label={`Daily end time ${idx + 1}`} />
									<button type="button" onClick={() => toggleDailyConstraintEndTime(idx)} className="h-10 w-8 inline-flex items-center justify-center rounded-r-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50" aria-label={`Remove end time for constraint ${idx + 1}`}>
										<FaMinus className="text-xs" />
									</button>
								</div>
							) : (
								<button type="button" onClick={() => toggleDailyConstraintEndTime(idx)} className="mt-1 w-44 h-10 inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700 shadow-sm hover:bg-indigo-100" aria-label={`Add end time for constraint ${idx + 1}`}>{'Add end time'}</button>
							)}
						</div>
						<button type="button" onClick={() => removeDailyConstraint(idx)} className="h-10 w-10 min-w-[2.5rem] inline-flex items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-600 hover:bg-amber-50" aria-label={`Remove daily constraint ${idx + 1}`}>
							<FaMinus className="text-xs" />
						</button>
					</div>
				))}
				<div className="flex justify-end">
					<button type="button" onClick={addDailyConstraint} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700 hover:bg-indigo-100" aria-label="Add daily start time">
						<FaPlus /> {'Add'}
					</button>
				</div>
			</div>
		</div>
	)

	const FixedSection = () => (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
			<h4 className="text-sm font-medium text-gray-800">{'Exact date and time'}</h4>
			<div className="grid sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Start'}</label>
					<div className="mt-1 flex gap-2">
						<input id="scheduled-time-date" type="date" value={getDatePart(scheduledTime)} onChange={(e) => { const dateStr = e.target.value; const timeStr = getTimePart(scheduledTime) || '00:00'; const ms = combineLocal(dateStr, timeStr); setScheduledTime(ms != null ? formatLocalDateTime(roundMsTo30Min(ms)) : '') }} min={todayDateStr} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Scheduled start date" />
						<select id="scheduled-time-time" value={getTimePart(scheduledTime)} onChange={(e) => { const timeStr = e.target.value; const dateStr = getDatePart(scheduledTime); const ms = combineLocal(dateStr, timeStr); setScheduledTime(ms != null ? formatLocalDateTime(roundMsTo30Min(ms)) : '') }} className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Scheduled start time" disabled={!getDatePart(scheduledTime)}>
							<option value="" disabled hidden>{'--:--'}</option>
							{Array.from({ length: 48 }).map((_, i) => { const m = i * 30; const v = formatTime(m); return (<option key={v} value={v}>{v}</option>) })}
						</select>
					</div>
				</div>
				<div>
					<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'End'}</label>
					<div className="mt-1 flex gap-2">
						<input
							id="scheduled-end-date"
							type="date"
							value={getDatePart(scheduledEnd)}
							onChange={(e) => {
								const dateStr = e.target.value
								const timeStr = getTimePart(scheduledEnd) || '00:00'
								const ms = combineLocal(dateStr, timeStr)
								const rounded = ms != null ? roundMsTo30Min(ms) : null
								setScheduledEnd(rounded != null ? formatLocalDateTime(rounded) : '')
								const s = parseDateTime(scheduledTime)
								if (s != null && rounded != null && rounded > s) {
									const diffMin = Math.floor((rounded - s) / 60000)
									const newDays = Math.floor(diffMin / (24 * 60))
									const rem = diffMin % (24 * 60)
									const newHours = Math.floor(rem / 60)
									const newMinutes = rem % 60
									setFixDurationDays(newDays); setFixDurationHours(newHours); setFixDurationMinutes(newMinutes)
								}
							}}
							className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
							aria-label="Scheduled end date"
						/>
						<select
							id="scheduled-end-time"
							value={getTimePart(scheduledEnd)}
							onChange={(e) => {
								const timeStr = e.target.value
								const dateStr = getDatePart(scheduledEnd)
								const ms = combineLocal(dateStr, timeStr)
								const rounded = ms != null ? roundMsTo30Min(ms) : null
								setScheduledEnd(rounded != null ? formatLocalDateTime(rounded) : '')
								const s = parseDateTime(scheduledTime)
								if (s != null && rounded != null && rounded > s) {
									const diffMin = Math.floor((rounded - s) / 60000)
									const newDays = Math.floor(diffMin / (24 * 60))
									const rem = diffMin % (24 * 60)
									const newHours = Math.floor(rem / 60)
									const newMinutes = rem % 60
									setFixDurationDays(newDays); setFixDurationHours(newHours); setFixDurationMinutes(newMinutes)
								}
							}}
							className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
							aria-label="Scheduled end time"
							disabled={!getDatePart(scheduledEnd)}
						>
							<option value="" disabled hidden>{'--:--'}</option>
							{Array.from({ length: 48 }).map((_, i) => { const m = i * 30; const v = formatTime(m); return (<option key={v} value={v}>{v}</option>) })}
						</select>
					</div>
				</div>
			</div>
			<div>
				<label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{'Duration'}</label>
				<div className="mt-1 flex items-end gap-4">
					<div className="flex flex-col w-20">
						<input
							id="fixed-duration-days"
							type="number"
							value={fixDurationDays}
							onChange={(e) => setFixDurationDays(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
							min={0}
							max={30}
							className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
							aria-label="Fixed duration in days"
						/>
						<span className="mt-1 text-xs uppercase tracking-wide text-gray-400">{'Days'}</span>
					</div>
					<div className="flex flex-col">
						<select
							value={formatTime(fixDurationHours * 60 + fixDurationMinutes)}
							onChange={(e) => { const totalMins = parseTime(e.target.value); setFixDurationHours(Math.floor(totalMins / 60)); setFixDurationMinutes(totalMins % 60) }}
							className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
							aria-label="Fixed duration in hours and minutes"
						>
							{Array.from({ length: 48 }).map((_, i) => { const total = i * 30; const h = Math.floor(total / 60); const m = total % 60; const v = formatTime(total); const label = `${h} h, ${m} m`; return (<option key={v} value={v}>{label}</option>) })}
						</select>
						<span className="mt-1 text-xs uppercase tracking-wide text-gray-400">{'HH, MM'}</span>
					</div>
				</div>
			</div>
		</div>
	)

	return (
		<Card className={`border-0 shadow-md scroll-mt-24 ${scheduleMode === 'dynamic' ? 'ring-1 ring-indigo-200/60' : ''}`} id="scheduling-section">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FaClock /> {'When should this happen?'}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="grid lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<div className="space-y-3">
							<button type="button" onClick={() => setScheduleMode('dynamic')} className={`w-full text-left rounded-xl border p-4 transition shadow-sm flex gap-3 ${scheduleMode === 'dynamic' ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-white ring-2 ring-indigo-200/70' : 'border-gray-200 bg-white hover:bg-gray-50'}`} aria-label="Flexible scheduling mode">
								<div className={`mt-1 h-2 w-2 rounded-full ${scheduleMode === 'dynamic' ? 'bg-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.25)]' : 'bg-gray-300'}`} />
								<div>
									<div className={`flex items-center gap-2 font-medium ${scheduleMode === 'dynamic' ? 'text-indigo-700' : 'text-gray-800'}`}><FaBolt className="text-xs" /> {'Flexible (Recommended)'}</div>
									<p className="mt-2 text-sm text-gray-700">{'Choose a time window and duration; '}<span className="text-yellow-500 font-semibold">{'RainDate'}</span>{' will automatically pick the best start within that window.'}</p>
									<p className="mt-1 text-xs text-gray-500">{'When '}<span className="text-yellow-500 font-semibold">{'RainDate'}</span>{' has selected a date, you must confirm it, or the scheduled time may keep moving forward.'}</p>
								</div>
							</button>							<button type="button" onClick={() => setScheduleMode('fixed')} className={`w-full text-left rounded-xl border p-4 transition shadow-sm flex gap-3 ${scheduleMode === 'fixed' ? 'border-indigo-300 bg-white ring-2 ring-indigo-200/70' : 'border-gray-200 bg-white hover:bg-gray-50'}`} aria-label="Fixed date mode">
								<div className={`mt-1 h-2 w-2 rounded-full ${scheduleMode === 'fixed' ? 'bg-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.25)]' : 'bg-gray-300'}`} />
								<div>
									<div className={`flex items-center gap-2 font-medium ${scheduleMode === 'fixed' ? 'text-indigo-700' : 'text-gray-800'}`}><FaSlidersH className="text-xs" /> {'Fixed Date and Time'}</div>
									<p className="mt-2 text-sm text-gray-700">{'Set an exact start and end, like a conventional event. '}<span className="text-yellow-500 font-semibold">{'RainDate'}</span>{' will not auto‑select it for you.'}</p>
								</div>
							</button>
						</div>
					</div>
					<div className="lg:col-span-2 space-y-6">
						{scheduleMode === 'dynamic' ? <DynamicSection /> : <FixedSection />}

						{scheduleMode === 'dynamic' && (
							<div className="border-t border-gray-200 pt-4">
								<div className="text-center">
									<button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30">
										<FaSlidersH className="text-xs" /> {showAdvanced ? 'Hide fine‑tune options' : 'Fine‑tune availability'}
									</button>
									<p className="mt-2 text-xs text-gray-500">{'Add preferred and excluded times to nudge '}<span className="text-yellow-500 font-semibold">{'RainDate'}</span>{' towards your ideal schedule.'}</p>
								</div>
								{showAdvanced && (
									<div className="mt-4 space-y-6">
										{renderTimeRanges('Preferred times', preferredTimes, setPreferredTimes)}
										{renderTimeRanges('Excluded times', blackoutPeriods, setBlackoutPeriods)}
										{showTimeline && (
											<div>
												<h4 className="text-sm font-medium text-gray-700 mb-2">{'Timeline preview'}</h4>
												<EventTimeline
													windowStart={startMs!}
													windowEnd={endMs!}
													duration={totalDynamicDurationMinutes * 60000}
													preferred={preferredTimes.filter((p): p is ITimeRange => p.start != null && p.end != null)}
													blackout={blackoutPeriods.filter((b): b is ITimeRange => b.start != null && b.end != null)}
													scheduledTime={undefined}
												/>
											</div>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
})

Scheduling.displayName = 'Scheduling'
export default Scheduling
