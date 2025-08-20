export type ScheduleMode = 'fixed' | 'dynamic'

export type Member = { userId: string, role: 'creator' | 'admin' | 'participant' }
export type TimeRange = { start: number | null, end: number | null }
export type DailyConstraint = { start: number, end?: number }
