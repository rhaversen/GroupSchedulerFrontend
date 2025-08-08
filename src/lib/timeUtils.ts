import dayjs from 'dayjs'

export function timeSince (dateString: string): string {
	const seconds = Math.max(Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000), 0)

	let interval = Math.floor(seconds / 31536000)
	if (interval >= 1) {
		const months = Math.floor((seconds % 31536000) / 2592000)
		return `${interval} ${interval === 1 ? 'year' : 'years'}${months > 0 ? ` and ${months} ${months !== 1 ? 'months' : 'month'}` : ''} ago`
	}

	interval = Math.floor(seconds / 2592000)
	if (interval >= 1) {
		const days = Math.floor((seconds % 2592000) / 86400)
		return `${interval} ${interval === 1 ? 'month' : 'months'}${days > 0 ? ` and ${days} ${days !== 1 ? 'days' : 'day'}` : ''} ago`
	}

	interval = Math.floor(seconds / 86400)
	if (interval >= 1) {
		const hours = Math.floor((seconds % 86400) / 3600)
		return `${interval} ${interval === 1 ? 'day' : 'days'}${hours > 0 ? ` and ${hours} ${hours !== 1 ? 'hours' : 'hour'}` : ''} ago`
	}

	interval = Math.floor(seconds / 3600)
	if (interval >= 1) {
		const minutes = Math.floor((seconds % 3600) / 60)
		return `${interval} ${interval === 1 ? 'hour' : 'hours'}${minutes > 0 ? ` and ${minutes} ${minutes !== 1 ? 'minutes' : 'minute'}` : ''} ago`
	}

	interval = Math.floor(seconds / 60)
	if (interval >= 1) {
		return `${interval} ${interval === 1 ? 'minute' : 'minutes'} ago`
	}

	return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`
}

export function timeUntil (dateString: string | number): string {
	const seconds = Math.floor((new Date(dateString).valueOf() - new Date().getTime()) / 1000)

	if (seconds <= 0) { return 'Expired' }

	let interval = Math.floor(seconds / 31536000)
	if (interval >= 1) {
		const months = Math.floor((seconds % 31536000) / 2592000)
		return `in ${interval} ${interval === 1 ? 'year' : 'years'}${months > 0 ? ` and ${months} ${months !== 1 ? 'months' : 'month'}` : ''}`
	}

	interval = Math.floor(seconds / 2592000)
	if (interval >= 1) {
		const days = Math.floor((seconds % 2592000) / 86400)
		return `in ${interval} ${interval === 1 ? 'month' : 'months'}${days > 0 ? ` and ${days} ${days !== 1 ? 'days' : 'day'}` : ''}`
	}

	interval = Math.floor(seconds / 86400)
	if (interval >= 1) {
		const hours = Math.floor((seconds % 86400) / 3600)
		return `in ${interval} ${interval === 1 ? 'day' : 'days'}${hours > 0 ? ` and ${hours} ${hours !== 1 ? 'hours' : 'hour'}` : ''}`
	}

	interval = Math.floor(seconds / 3600)
	if (interval >= 1) {
		const minutes = Math.floor((seconds % 3600) / 60)
		return `in ${interval} ${interval === 1 ? 'hour' : 'hours'}${minutes > 0 ? ` and ${minutes} ${minutes !== 1 ? 'minutes' : 'minute'}` : ''}`
	}

	interval = Math.floor(seconds / 60)
	if (interval >= 1) {
		return `in ${interval} ${interval === 1 ? 'minute' : 'minutes'}`
	}

	return `in ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
}

// Helper to check if a date is today (local time)
function isToday (date: Date): boolean {
	const now = new Date()
	return (
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth() &&
		date.getDate() === now.getDate()
	)
}

// Helper to check if a date is tomorrow (local time)
function isTomorrow (date: Date): boolean {
	const now = new Date()
	const tomorrow = new Date(now)
	tomorrow.setHours(0, 0, 0, 0)
	tomorrow.setDate(now.getDate() + 1)
	return (
		date.getFullYear() === tomorrow.getFullYear() &&
		date.getMonth() === tomorrow.getMonth() &&
		date.getDate() === tomorrow.getDate()
	)
}

export function formatRelativeDateLabel (date: Date | string | null): string {
	if (date == null) { return 'unknown' }
	const timeStr = dayjs(date).format('[at] HH:mm')
	const dateObj = typeof date === 'string' ? dayjs(date).toDate() : date
	if (isToday(dateObj)) {
		return `today ${timeStr}`
	}
	if (isTomorrow(dateObj)) {
		return `tomorrow ${timeStr}`
	}
	return formatFullDateLabel(dateObj)
}

export function formatFullDateLabel (date: Date): string {
	const formatted = dayjs(date).format('dddd, DD/MM [at] HH:mm')
	// Capitalize first letter of formatted string
	return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`
}
