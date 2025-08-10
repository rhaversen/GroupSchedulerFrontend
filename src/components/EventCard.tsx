'use client'

import Link from 'next/link'
import { FaUserTie, FaCog, FaUser, FaQuestionCircle, FaEdit, FaClock, FaCalendarAlt, FaCheckCircle, FaTimes, FaClipboardList, FaGlobe } from 'react-icons/fa'

import { Badge, Card, CardContent } from '@/components/ui'
import { timeSince, timeUntil } from '@/lib/timeUtils'
import { type EventType } from '@/types/backendDataTypes'

interface EventCardProps {
	event: EventType
	currentUser?: { _id: string } | null
	userNames?: Map<string, string>
}

export function EventCard ({ event, currentUser = null, userNames }: EventCardProps) {
	const getUserRole = () => {
		const member = event.members.find(m => m.userId === currentUser?._id)
		return member?.role || 'unknown'
	}

	const getCreator = () => event.members.find(m => m.role === 'creator')

	const getCreatorName = () => {
		const creator = getCreator()
		if (!creator) { return 'Unknown' }
		if (creator.userId === currentUser?._id) { return 'you' }
		if (userNames != null && userNames.has(creator.userId)) { return userNames.get(creator.userId) as string }
		return 'Unknown User'
	}

	const getRoleDisplay = (role: string) => {
		switch (role) {
			case 'creator':
				return { text: 'Creator', color: 'text-purple-600', icon: <FaUserTie />, showRole: true }
			case 'admin':
				return { text: 'Admin', color: 'text-blue-600', icon: <FaCog />, showRole: true }
			case 'participant':
				return { text: 'Participant', color: 'text-green-600', icon: <FaUser />, showRole: false }
			default:
				return { text: 'Unknown', color: 'text-gray-600', icon: <FaQuestionCircle />, showRole: false }
		}
	}

	const getStatusColor = (status: EventType['status']) => {
		switch (status) {
			case 'draft':
				return 'bg-gray-100 text-gray-800'
			case 'scheduling':
				return 'bg-yellow-100 text-yellow-800'
			case 'scheduled':
				return 'bg-blue-100 text-blue-800'
			case 'confirmed':
				return 'bg-green-100 text-green-800'
			case 'cancelled':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const getStatusIcon = (status: EventType['status']) => {
		switch (status) {
			case 'draft': return <FaEdit className="text-gray-500" />
			case 'scheduling': return <FaClock className="text-yellow-500" />
			case 'scheduled': return <FaCalendarAlt className="text-blue-500" />
			case 'confirmed': return <FaCheckCircle className="text-green-500" />
			case 'cancelled': return <FaTimes className="text-red-500" />
			default: return <FaClipboardList className="text-gray-400" />
		}
	}

	const eventTime = event.scheduledTime !== null && event.scheduledTime !== undefined
		? new Date(event.scheduledTime)
		: new Date(event.timeWindow.end)
	const isUpcoming = eventTime.getTime() > Date.now()
	const userRole = getUserRole()
	const roleDisplay = getRoleDisplay(userRole)
	const creator = getCreator()
	const creatorName = getCreatorName()

	return (
		<Card className="border-0 shadow-md">
			<CardContent>
				<div className="pt-2 mb-4">
					<div className="flex items-baseline gap-3 mb-2">
						<h3 className="font-semibold text-gray-900 truncate text-xl">
							{event.name}
						</h3>
						{creator && (
							<Link
								href={`/people/${creator.userId}`}
								className="text-sm text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer flex-shrink-0 underline hover:no-underline"
							>
								{'by '}{creatorName}
							</Link>
						)}
					</div>
					<p className="text-sm text-gray-600 line-clamp-2 mb-4">
						{event.description}
					</p>
					{roleDisplay.showRole && (
						<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-full mb-2">
							<span className="text-sm">{roleDisplay.icon}</span>
							<span className={`text-sm font-medium ${roleDisplay.color}`}>
								{'You\'re a '}{roleDisplay.text.toLowerCase()}{' of this event'}
							</span>
						</div>
					)}
				</div>

				<div className="space-y-3 text-sm text-gray-600">
					{event.scheduledTime !== null && event.scheduledTime !== undefined ? (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
									{'Scheduled'}
								</span>
								<span className="font-medium">
									{new Date(event.scheduledTime).toLocaleDateString()}
								</span>
							</div>
							{isUpcoming && (
								<span className="text-xs text-gray-500 font-medium">
									{timeUntil(event.scheduledTime)}
								</span>
							)}
						</div>
					) : (
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
								{'Window'}
							</span>
							<span>
								{new Date(event.timeWindow.start).toLocaleDateString()}{' - '}{new Date(event.timeWindow.end).toLocaleDateString()}
							</span>
						</div>
					)}

					<div className="flex items-center gap-2">
						<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
							{'Members'}
						</span>
						<span>{event.members.length}</span>
					</div>
				</div>

				<div className="mt-4 pt-3 border-t border-gray-100">
					<div className="flex justify-between items-start mb-3">
						<span className="text-xs text-gray-500">
							{'Updated '}{timeSince(event.updatedAt)}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							{event.public && (
								<Badge variant="info" className="bg-purple-100 text-purple-800 text-xs">
									<FaGlobe className="inline mr-1" /> Public
								</Badge>
							)}
							<Badge className={`${getStatusColor(event.status)} text-xs`}>
								<span className="inline mr-1">{getStatusIcon(event.status)}</span> {event.status}
							</Badge>
						</div>
						<Link
							className="inline-flex items-center px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 rounded-md transition-all duration-200 shadow-sm"
							href={`/events/${event._id}`}
						>
							{'View Details'}
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default EventCard
