import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import Head from 'next/head'
import axios from 'axios'

const localizer = momentLocalizer(moment)
const API_V1_URL = process.env.NEXT_PUBLIC_API_V1_URL ?? ''

interface DateRange {
    start: Date
    end: Date
}

interface CalendarEvent {
    start: Date
    end: Date
    title: string
    allDay: boolean
}

const CalendarPage: React.FC = () => {
    const [blockedDates, setBlockedDates] = useState<Date[]>([])

    useEffect(() => {
        fetchBlockedDates()
    }, [])

    const fetchBlockedDates = async () => {
        try {
            const response = await axios.get(`${API_V1_URL}users/current-user`)
            const dates = response.data.blockedDates.map(fromUTCDate)
            setBlockedDates(dates)
        } catch (error) {
            console.error('Error fetching blocked dates:', error)
        }
    }

    const handleSelect = ({ start, end }: { start: Date, end: Date }) => {
        const adjustedEnd = new Date(end)
        adjustedEnd.setDate(end.getDate() - 1)

        console.log(start)
        console.log(adjustedEnd)
        const range = getDatesInRange(start, adjustedEnd)
        const rangeIsBlocked = range.every(date => blockedDates.some(d => isSameDay(d, date)))
        const newBlockedDates = rangeIsBlocked
            // If all dates are blocked, unblock them
            ? unblockDates(range)
            : blockDates(range)

        rangeIsBlocked
            // If at least one date is not blocked, block all unblocked dates
            ? deleteDateRangeBackend(start, range[range.length - 1])
            : createDateRangeBackend(start, range[range.length - 1])

        setBlockedDates(newBlockedDates)
    }

    const unblockDates = (range: Date[]) => blockedDates.filter(
        blockedDate => !range.some(date => isSameDay(date, blockedDate))
    )

    const blockDates = (range: Date[]) => [
        ...blockedDates,
        ...range.filter(date => !blockedDates.some(d => isSameDay(d, date)))
    ]

    const calendarEvents = mergeConsecutiveDates(blockedDates).map(dateRangeToEvent)

    return (
        <div className="calendar-container">
            <Head>
                <title>Calendar - Blocked Dates</title>
            </Head>
            <Calendar
                selectable
                defaultDate={new Date()}
                defaultView="month"
                events={calendarEvents}
                localizer={localizer}
                style={{ height: '80vh' }}
                onSelectSlot={handleSelect}
                views={['month']}
            />
        </div>
    )
}

const fromUTCDate = (dateString: string): Date => {
    const date = new Date(dateString)
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

const toUTCDate = (date: Date): Date => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

const createDateRangeBackend = async (startDate: Date, endDate: Date) => {
    console.log(startDate)
    console.log(endDate)
    try {
        await axios.put(`${API_V1_URL}users/blockedDates/${toUTCDate(startDate).toISOString()}/${toUTCDate(endDate).toISOString()}`)
    } catch (err) {
        console.error('Error saving date range: ' + err)
    }
}

const deleteDateRangeBackend = async (startDate: Date, endDate: Date) => {
    console.log(startDate)
    console.log(endDate)
    try {
        await axios.delete(`${API_V1_URL}users/blockedDates/${toUTCDate(startDate).toISOString()}/${toUTCDate(endDate).toISOString()}`)
    } catch (err) {
        console.error('Error deleting date range: ' + err)
    }
}

// Utility function to merge consecutive dates into ranges
const mergeConsecutiveDates = (dates: Date[]): DateRange[] => {
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime())
    const merged: DateRange[] = []
    let rangeStart: Date | null = null
    let rangeEnd: Date | null = null

    sortedDates.forEach((date, i) => {
        if (!rangeStart) {
            rangeStart = date
            rangeEnd = date
        } else if (rangeEnd && isNextDay(rangeEnd, date)) {
            rangeEnd = date
        } else {
            if (rangeStart && rangeEnd) {
                merged.push(createRange(rangeStart, rangeEnd))
            }
            rangeStart = date
            rangeEnd = date
        }

        if (i === sortedDates.length - 1 && rangeStart && rangeEnd) {
            merged.push(createRange(rangeStart, rangeEnd))
        }
    })

    return merged
}

const createRange = (start: Date, end: Date): DateRange => {
    const adjustedEnd = new Date(end)
    adjustedEnd.setDate(adjustedEnd.getDate() + 1)
    return { start, end: adjustedEnd }
}

const dateRangeToEvent = (range: DateRange): CalendarEvent => ({
    start: range.start,
    end: range.end,
    title: 'Blocked',
    allDay: true
})

const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
    const date = new Date(startDate.getTime())
    const dates = []

    while (date <= endDate) {
        dates.push(new Date(date))
        date.setDate(date.getDate() + 1)
    }
    return dates
}

const isSameDay = (date1: Date, date2: Date): boolean => (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
)

const isNextDay = (date1: Date, date2: Date): boolean => {
    const nextDay = new Date(date1)
    nextDay.setDate(nextDay.getDate() + 1)
    return isSameDay(nextDay, date2)
}

export default CalendarPage
