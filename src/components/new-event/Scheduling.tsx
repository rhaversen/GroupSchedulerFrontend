'use client'

import { useMemo, useState } from 'react'
import { FaClock, FaPlus, FaTrash } from 'react-icons/fa'

import EventTimeline from '@/components/EventTimeline'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { type ITimeRange } from '@/types/backendDataTypes'
import { type DailyConstraint, type TimeRange, type ScheduleMode } from '@/types/newEvent'

function pad2 (n: number): string { return n < 10 ? `0${n}` : `${n}` }
function formatTime (minutes: number): string { const h = Math.floor(minutes / 60); const m = minutes % 60; return `${pad2(h)}:${pad2(m)}` }
function parseTime (timeStr: string): number { const [h, m] = timeStr.split(':').map(x => parseInt(x, 10) || 0); return (h * 60) + m }
function parseDateTime (value: string): number | null { if (!value) { return null } const ms = new Date(value).getTime(); return Number.isNaN(ms) ? null : ms }
function formatLocalDateTime (ms: number): string { const d = new Date(ms); const yyyy = d.getFullYear(); const mm = pad2(d.getMonth() + 1); const dd = pad2(d.getDate()); const hh = pad2(d.getHours()); const mi = pad2(d.getMinutes()); return `${yyyy}-${mm}-${dd}T${hh}:${mi}` }

export default function Scheduling ({
  scheduleMode, setScheduleMode,
  scheduledTime, setScheduledTime,
  scheduledEnd, setScheduledEnd,
  durationDays, setDurationDays,
  durationHours, setDurationHours,
  durationMinutes, setDurationMinutes,
  errors,
  preferredTimes, setPreferredTimes,
  blackoutPeriods, setBlackoutPeriods,
  dailyConstraints, setDailyConstraints,
  timeWindowStart, timeWindowEnd,
  setTimeWindowStart, setTimeWindowEnd,
  totalDurationMinutes
}: {
  scheduleMode: ScheduleMode
  setScheduleMode: (m: ScheduleMode) => void
  scheduledTime: string
  setScheduledTime: (v: string) => void
  scheduledEnd: string
  setScheduledEnd: (v: string) => void
  durationDays: number
  setDurationDays: (n: number) => void
  durationHours: number
  setDurationHours: (n: number) => void
  durationMinutes: number
  setDurationMinutes: (n: number) => void
  errors: Record<string, string>
  preferredTimes: TimeRange[]
  setPreferredTimes: (v: TimeRange[]) => void
  blackoutPeriods: TimeRange[]
  setBlackoutPeriods: (v: TimeRange[]) => void
  dailyConstraints: DailyConstraint[]
  setDailyConstraints: (v: DailyConstraint[]) => void
  timeWindowStart: string
  timeWindowEnd: string
  setTimeWindowStart: (v: string) => void
  setTimeWindowEnd: (v: string) => void
  totalDurationMinutes: number
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const nowLocal = useMemo(() => formatLocalDateTime(Date.now()), [])
  const startMs = useMemo(() => parseDateTime(timeWindowStart), [timeWindowStart])
  const endMs = useMemo(() => parseDateTime(timeWindowEnd), [timeWindowEnd])
  const minEndLocal = useMemo(() => formatLocalDateTime(Math.max(Date.now(), startMs ?? 0)), [startMs])
  const showTimeline = Boolean(startMs != null && endMs != null && endMs > startMs && totalDurationMinutes > 0)

  const addTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[]) => setter([...ranges, { start: null, end: null }])
  const removeTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[], idx: number) => setter(ranges.filter((_, i) => i !== idx))
  const updateTimeRange = (setter: (ranges: TimeRange[]) => void, ranges: TimeRange[], idx: number, field: 'start' | 'end', value: string) => {
    const ms = parseDateTime(value)
    const startBound = parseDateTime(timeWindowStart)
    const endBound = parseDateTime(timeWindowEnd)
    let clamped: number | null = ms
    if (ms != null) {
      if (startBound != null && ms < startBound) { clamped = startBound }
      if (endBound != null && ms > endBound) { clamped = endBound }
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">{label}</h4>
        <button type="button" onClick={() => addTimeRange(setter, ranges)} className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center gap-1" aria-label={`Add ${label.toLowerCase()}`}>
          <FaPlus /> {'Add'}
        </button>
      </div>
      {ranges.length === 0 && <p className="text-xs text-gray-400">{'None'}</p>}
      {ranges.map((range, idx) => (
        <div key={idx} className="grid sm:grid-cols-2 gap-2 items-end">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">{'Start'}</label>
            <input type="datetime-local" className="mt-1 w-full border rounded px-2 py-1 text-sm" value={range.start != null ? formatLocalDateTime(range.start) : ''} onChange={(e) => updateTimeRange(setter, ranges, idx, 'start', e.target.value)} min={timeWindowStart || undefined} max={timeWindowEnd || undefined} aria-label={`${label} start time ${idx + 1}`} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">{'End'}</label>
            <div className="flex gap-2">
              <input type="datetime-local" className="mt-1 w-full border rounded px-2 py-1 text-sm" value={range.end != null ? formatLocalDateTime(range.end) : ''} onChange={(e) => updateTimeRange(setter, ranges, idx, 'end', e.target.value)} min={timeWindowStart || undefined} max={timeWindowEnd || undefined} aria-label={`${label} end time ${idx + 1}`} />
              <button type="button" onClick={() => removeTimeRange(setter, ranges, idx)} className="mt-1 h-8 w-8 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200" aria-label={`Remove ${label.toLowerCase()} ${idx + 1}`}>
                <FaTrash className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const sFixed = parseDateTime(scheduledTime)
  const eFixed = parseDateTime(scheduledEnd)
  const fixedMinEndStr = useMemo(() => formatLocalDateTime(Math.max(Date.now(), sFixed ?? Date.now())), [sFixed])
  const fixedDurationLabel = useMemo(() => {
    if (sFixed != null && eFixed != null && eFixed > sFixed) {
      const diffMin = Math.floor((eFixed - sFixed) / 60000)
      const d = Math.floor(diffMin / (24 * 60))
      const hm = diffMin % (24 * 60)
      return `${d > 0 ? d + 'd ' : ''}${formatTime(hm)}`
    }
    return null
  }, [sFixed, eFixed])

  return (
    <Card className="border-0 shadow-md scroll-mt-24" id="scheduling-section">
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
            <p className="text-[11px] text-gray-500 leading-relaxed">{'System picks the best start time within the window using preferences and constraints.'}</p>
          )}
          {scheduleMode === 'fixed' && (
            <p className="text-[11px] text-gray-500 leading-relaxed">{'Event occurs exactly at the time you choose.'}</p>
          )}
        </div>

        {scheduleMode === 'dynamic' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">{'Time Window Start'}</label>
                <input id="time-window-start" type="datetime-local" value={timeWindowStart} onChange={(e) => setTimeWindowStart(e.target.value)} min={nowLocal} max={timeWindowEnd || undefined} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Time window start" />
                <p className="mt-1 text-[11px] text-gray-500">{'Earliest allowed start for a flexible event.'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{'Time Window End'}</label>
                <input id="time-window-end" type="datetime-local" value={timeWindowEnd} onChange={(e) => setTimeWindowEnd(e.target.value)} min={minEndLocal} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Time window end" />
                <p className="mt-1 text-[11px] text-gray-500">{'Latest allowed end of the window.'}</p>
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
                <p className="mt-1 text-[11px] text-gray-500">{'Must fit inside the Time Window.'}</p>
                {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>}
              </div>
            </div>
            {errors.timeWindow && <p className="-mt-1 text-xs text-red-600">{errors.timeWindow}</p>}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{'Advanced options'}</span>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">
                {showAdvanced ? 'Hide' : 'Show'}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">{'Daily Start Times'}</h4>
                    <button type="button" onClick={addDailyConstraint} className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center gap-1" aria-label="Add daily start time">
                      <FaPlus /> {'Add'}
                    </button>
                  </div>
                  {dailyConstraints.length === 0 && <p className="text-xs text-gray-400">{'None'}</p>}
                  {dailyConstraints.map((constraint, idx) => (
                    <div key={idx} className="flex items-end gap-3">
                      <div className="flex flex-col">
                        <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">{'Start'}</label>
                        <input type="time" value={formatTime(constraint.start)} onChange={(e) => updateDailyConstraint(idx, 'start', parseTime(e.target.value))} className="mt-1 w-32 border rounded px-2 py-1 text-sm" aria-label={`Daily start time ${idx + 1}`} />
                      </div>
                      {constraint.end !== undefined && (
                        <div className="flex flex-col">
                          <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">{'End'}</label>
                          <input type="time" value={formatTime(constraint.end)} onChange={(e) => updateDailyConstraint(idx, 'end', parseTime(e.target.value))} className="mt-1 w-32 border rounded px-2 py-1 text-sm" aria-label={`Daily end time ${idx + 1}`} />
                        </div>
                      )}
                      <div className="flex gap-2">
                        {constraint.end === undefined ? (
                          <button type="button" onClick={() => toggleDailyConstraintEndTime(idx)} className="h-8 px-3 flex items-center justify-center rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs" aria-label={`Add end time for constraint ${idx + 1}`}>
                            {'Add End Time'}
                          </button>
                        ) : (
                          <button type="button" onClick={() => toggleDailyConstraintEndTime(idx)} className="h-8 px-3 flex items-center justify-center rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs" aria-label={`Remove end time for constraint ${idx + 1}`}>
                            {'Remove End'}
                          </button>
                        )}
                        <button type="button" onClick={() => removeDailyConstraint(idx)} className="h-8 w-8 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200" aria-label={`Remove daily constraint ${idx + 1}`}>
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

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
          </div>
        )}

        {scheduleMode === 'fixed' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{'Scheduled Start'}</label>
              <input id="scheduled-time" type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} min={nowLocal} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Scheduled start time" />
              {errors.scheduledTime && <p className="mt-1 text-xs text-red-600">{errors.scheduledTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{'Scheduled End'}</label>
              <input id="scheduled-end" type="datetime-local" value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)} min={fixedMinEndStr} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" aria-label="Scheduled end time" />
              {errors.scheduledEnd && <p className="mt-1 text-xs text-red-600">{errors.scheduledEnd}</p>}
              {(fixedDurationLabel != null) ? (
                <p className="mt-2 text-xs text-gray-600">{'Duration: '}{fixedDurationLabel}</p>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
