export type ScheduleMode = 'fixed' | 'dynamic'

export type Member = { userId: string, role: 'creator' | 'admin' | 'participant' }
export type TimeRange = { start: number | null, end: number | null }
// DailyConstraint times are milliseconds from start of local day (0–86_400_000)
export type DailyConstraint = { start: number, end?: number }
