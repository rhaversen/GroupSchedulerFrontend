import React, { useMemo, useState } from 'react'

import { formatFullDateLabel } from '@/lib/timeUtils'
import { type ITimeRange } from '@/types/backendDataTypes'

export interface EventTimelineProps {
	windowStart: number
	windowEnd: number
	duration: number
	preferred?: ITimeRange[]
	blackout?: ITimeRange[]
	scheduledTime?: number
	className?: string
}

// Renders a horizontal timeline representing the event scheduling window with preferred and blackout periods.
export default function EventTimeline ({ windowStart, windowEnd, duration, preferred = [], blackout = [], scheduledTime, className = '' }: EventTimelineProps) {
	const totalMs = windowEnd - windowStart
	const safeTotal = totalMs <= 0 ? 1 : totalMs

	// Hover state for timeline tooltip
	const [hoverPosition, setHoverPosition] = useState<{ x: number, timestamp: number } | null>(null)

	// Normalize duration: backend may supply minutes (e.g. 180) instead of ms (e.g. 10800000)
	const normalizedDuration = duration < 60000 ? duration * 60000 : duration

	const scheduledRange: ITimeRange | null = useMemo(() => {
		if (scheduledTime == null) {
			return null
		}
		const start = Math.max(windowStart, scheduledTime)
		const end = Math.min(windowEnd, scheduledTime + normalizedDuration)
		if (end <= start) {
			return null
		}
		return { start, end }
	}, [scheduledTime, normalizedDuration, windowStart, windowEnd])

	const scale = (ms: number) => ((ms - windowStart) / safeTotal) * 100

	const filteredPreferred = preferred.filter(r => r.start < r.end && r.end > windowStart && r.start < windowEnd)
	const filteredBlackout = blackout.filter(r => r.start < r.end && r.end > windowStart && r.start < windowEnd)

	const legendBase = [
		{ key: 'blackout', label: 'Blackout', color: 'bg-red-400/70' },
		{ key: 'preferred', label: 'Preferred', color: 'bg-green-400' }
	]

	// Handle mouse events for hover tooltip on base bar
	const handleBaseBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const x = e.clientX - rect.left
		const percentage = (x / rect.width) * 100
		const timestamp = windowStart + (percentage / 100) * safeTotal

		setHoverPosition({ x: percentage, timestamp })
	}

	// Handle mouse events for hover tooltip on overlay elements
	const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		// Calculate relative to the timeline container for overlays
		const timelineContainer = e.currentTarget.closest('.relative') as HTMLElement | null
		if (timelineContainer != null) {
			const containerRect = timelineContainer.getBoundingClientRect()
			const x = e.clientX - containerRect.left
			const percentage = (x / containerRect.width) * 100
			const timestamp = windowStart + (percentage / 100) * safeTotal

			setHoverPosition({ x: percentage, timestamp })
		}
	}

	const handleMouseLeave = () => {
		setHoverPosition(null)
	}

	// Format hover tooltip text
	const formatHoverTime = (timestamp: number) => {
		const date = new Date(timestamp)
		const weekday = date.toLocaleDateString(undefined, { weekday: 'long' })
		const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
		const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
		return `${weekday}, ${dateStr} at ${timeStr}`
	}

	return (
		<div className={`w-full select-none ${className}`}>
			<div className="relative h-24">
				{/* Base bar with hover functionality */}
				<div
					className="absolute inset-x-0 top-10 h-7 bg-slate-200 cursor-crosshair"
					onMouseMove={handleBaseBarMouseMove}
					onMouseLeave={handleMouseLeave}
				/>
				{/* Top start marker */}
				<div className="absolute left-0 top-0 flex flex-col items-start" title={formatFullDateLabel(new Date(windowStart))}>
					<div className="px-3 py-1.5 rounded-md bg-slate-700 text-white text-[11px] font-semibold shadow-sm tracking-tight">
						{formatFullDateLabel(new Date(windowStart))}
					</div>
					<div className="w-px flex-1 bg-slate-400/60 mt-1" />
				</div>
				{/* Top end marker */}
				<div className="absolute right-0 top-0 flex flex-col items-end" title={formatFullDateLabel(new Date(windowEnd))}>
					<div className="px-3 py-1.5 rounded-md bg-slate-700 text-white text-[11px] font-semibold shadow-sm tracking-tight text-right">
						{formatFullDateLabel(new Date(windowEnd))}
					</div>
					<div className="w-px flex-1 bg-slate-400/60 mt-1" />
				</div>
				{/* Midnight ticks and midpoint day labels */}
				{(() => {
					const elements: React.ReactElement[] = []
					const startDate = new Date(windowStart)
					const firstMidnight = new Date(startDate)
					firstMidnight.setHours(0, 0, 0, 0)
					if (firstMidnight.getTime() < windowStart) {
						firstMidnight.setDate(firstMidnight.getDate() + 1)
					}
					const tickTimes: number[] = []
					let cursor = firstMidnight.getTime()
					while (cursor <= windowEnd) {
						tickTimes.push(cursor)
						cursor += 24 * 60 * 60 * 1000
					}
					// Improved per-day rendering including partial first & last days without duplicate trailing labels.
					const dayMs = 24 * 60 * 60 * 1000
					const firstDayStart = (() => { const d = new Date(windowStart); d.setHours(0, 0, 0, 0); return d.getTime() })()
					let dayCursor = firstDayStart
					if (dayCursor > windowStart) { // step back one day to cover partial first day
						dayCursor -= dayMs
					}
					while (dayCursor < windowEnd) {
						const dayStart = Math.max(dayCursor, windowStart)
						const dayEnd = Math.min(dayCursor + dayMs, windowEnd)
						if (dayEnd <= dayStart) {
							dayCursor += dayMs
							continue
						}
						// Gradient segment
						const leftPct = Math.max(0, scale(dayStart))
						const rightPct = Math.min(100, scale(dayEnd))
						const widthPct = rightPct - leftPct
						if (widthPct > 0) {
							elements.push(
								<div
									key={`gradient-${dayCursor}`}
									className="absolute top-10 h-7 pointer-events-none"
									style={{
										left: `${leftPct}%`,
										width: `${widthPct}%`,
										background: `linear-gradient(to right,
						rgba(30, 41, 59, .25) 0%,
						rgba(100, 116, 139, .2) 25%,
						rgba(252, 211, 77, .25) 50%,
						rgba(100, 116, 139, .2) 75%,
						rgba(30, 41, 59, .25) 100%
					)`
									}}
								/>
							)
						}
						// Label rules:
						//	- Always label first overlapping day (even if partial)
						//	- For final day: only label if full 24h overlap
						const isFirstDay = dayStart <= windowStart && windowStart < dayEnd
						const isLastIteration = (dayCursor + dayMs) >= windowEnd
						const fullDay = (dayEnd - dayStart) >= dayMs
						const shouldLabel = isFirstDay || (!isLastIteration) || (isLastIteration && fullDay)
						if (shouldLabel) {
							const labelMid = dayStart + (dayEnd - dayStart) / 2
							const midPct = scale(labelMid)
							const labelDate = new Date(dayStart)
							const label = labelDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
							elements.push(
								<div key={`label-${dayCursor}`} className="absolute pointer-events-none" style={{ left: `${midPct}%`, top: '40px' }}>
									<div className="absolute top-9 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-600" title={label}>{label}</div>
								</div>
							)
						}
						dayCursor += dayMs
					}
					return elements
				})()}
				{filteredBlackout.map((r, i) => {
					const left = Math.max(0, scale(r.start))
					const right = Math.min(100, scale(r.end))
					const width = Math.max(0, right - left)
					return (
						<div
							key={`black-${i}`}
							className="absolute top-10 h-7 bg-red-500/50 cursor-crosshair"
							style={{ left: `${left}%`, width: `${width}%` }}
							title={`Blackout: ${new Date(r.start).toLocaleString()} - ${new Date(r.end).toLocaleString()}`}
							onMouseMove={handleOverlayMouseMove}
							onMouseLeave={handleMouseLeave}
						/>
					)
				})}
				{filteredPreferred.map((r, i) => {
					const left = Math.max(0, scale(r.start))
					const right = Math.min(100, scale(r.end))
					const width = Math.max(0, right - left)
					return (
						<div
							key={`pref-${i}`}
							className="absolute top-10 h-7 bg-emerald-500/60 cursor-crosshair"
							style={{ left: `${left}%`, width: `${width}%` }}
							title={`Preferred: ${new Date(r.start).toLocaleString()} - ${new Date(r.end).toLocaleString()}`}
							onMouseMove={handleOverlayMouseMove}
							onMouseLeave={handleMouseLeave}
						/>
					)
				})}
				{scheduledRange && (() => {
					const leftPct = Math.max(0, scale(scheduledRange.start))
					const rightPct = Math.min(100, scale(scheduledRange.end))
					const widthPct = Math.max(0, rightPct - leftPct)
					const effectiveDuration = scheduledRange.end - scheduledRange.start
					return (
						<div
							className="absolute top-[38px] h-9 shadow-sm cursor-crosshair bg-slate-400 border border-slate-600/60"
							style={{ left: `${leftPct}%`, width: `${Math.max(2, widthPct)}%` }}
							title={`Scheduled: ${new Date(scheduledRange.start).toLocaleString()} (${Math.round(effectiveDuration / 60000)} min)`}
							onMouseMove={handleOverlayMouseMove}
							onMouseLeave={handleMouseLeave}
						/>
					)
				})()}
				{/* Hover tooltip */}
				{hoverPosition && (
					<div
						className="absolute pointer-events-none z-10"
						style={{ left: `${hoverPosition.x}%`, top: '40px', transform: 'translateX(-50%)' }}
					>
						{/* Vertical tick line */}
						<div className="w-0.5 h-7 bg-slate-800 mx-auto" />
						{/* Tooltip label */}
						<div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
							<div className="px-3 py-1.5 rounded-md bg-slate-800 text-white text-xs font-medium shadow-lg">
								{formatHoverTime(hoverPosition.timestamp)}
							</div>
						</div>
					</div>
				)}
			</div>
			<div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-600">
				{legendBase.map(item => (
					<div key={item.key} className="flex items-center gap-1">
						<span className={`inline-block w-6 h-3 rounded ${item.color}`} />
						<span>{item.label}</span>
					</div>
				))}
				{scheduledRange && (
					<div className="flex items-center gap-1">
						<span className="inline-block w-6 h-3 rounded bg-slate-400 border border-slate-600/60" />
						<span>{'Scheduled'}</span>
					</div>
				)}
			</div>
		</div>
	)
}
