'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	HiOutlineCalendar,
	HiOutlineClock,
	HiOutlineUsers,
	HiOutlineExclamationCircle,
	HiOutlineCheckCircle,
	HiOutlineEye
} from 'react-icons/hi'

import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { formatFullDateLabel, formatRelativeDateLabel, timeUntil } from '@/lib/timeUtils'
import { type EventType, type UserType } from '@/types/backendDataTypes'

const getStatusBadgeVariant = (status: EventType['status']) => {
	switch (status) {
		case 'draft': return 'default'
		case 'scheduling': return 'warning'
		case 'scheduled': return 'info'
		case 'confirmed': return 'success'
		case 'cancelled': return 'danger'
		default: return 'default'
	}
}

const getStatusIcon = (status: EventType['status']) => {
	switch (status) {
		case 'confirmed': return <HiOutlineCheckCircle className="h-4 w-4" />
		case 'scheduling': return <HiOutlineClock className="h-4 w-4" />
		case 'scheduled': return <HiOutlineCalendar className="h-4 w-4" />
		case 'cancelled': return <HiOutlineExclamationCircle className="h-4 w-4" />
		default: return <HiOutlineCalendar className="h-4 w-4" />
	}
}

export default function EventDetailPage () {
	const params = useParams()
	const router = useRouter()
	const eventId = params.id as string
	const { currentUser } = useUser()

	const [event, setEvent] = useState<EventType | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [participantNames, setParticipantNames] = useState<Map<string, string>>(new Map())

	useEffect(() => {
		const loadEvent = async () => {
			try {
				const response = await api.get(`/v1/events/${eventId}`)
				const eventData = response.data
				setEvent(eventData)

				// Load participant names
				const names = new Map<string, string>()
				for (const participant of eventData.participants) {
					try {
						const userResponse = await api.get(`/v1/users/${participant.userId}`)
						const userData = userResponse.data as UserType
						names.set(participant.userId, userData.username)
					} catch (err) {
						console.warn(`Failed to fetch user ${participant.userId}:`, err)
						names.set(participant.userId, 'Unknown User')
					}
				}
				setParticipantNames(names)
			} catch (err) {
				console.error('Failed to load event:', err)
				setError('Failed to load event details')
			} finally {
				setLoading(false)
			}
		}

		if (eventId) {
			loadEvent()
		}
	}, [eventId])

	const getUserDisplayName = (userId: string) => {
		return participantNames.get(userId) ?? 'Unknown User'
	}

	const getCurrentUserRole = () => {
		if (currentUser == null || event == null) {
			return null
		}
		const userParticipant = event.participants.find(p => p.userId === currentUser._id)
		return userParticipant?.role ?? null
	}

	const getRoleDisplay = (role: string) => {
		switch (role) {
			case 'creator':
				return { text: 'Creator', color: 'text-purple-600', icon: '👑', bgColor: 'bg-purple-50' }
			case 'admin':
				return { text: 'Admin', color: 'text-blue-600', icon: '⚙️', bgColor: 'bg-blue-50' }
			case 'participant':
				return { text: 'Participant', color: 'text-green-600', icon: '👤', bgColor: 'bg-green-50' }
			default:
				return { text: 'Unknown', color: 'text-gray-600', icon: '❓', bgColor: 'bg-gray-50' }
		}
	}

	const handleUserClick = (userId: string) => {
		router.push(`/people/${userId}`)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<EventsSubNav />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		)
	}

	if ((error != null) || !event) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<EventsSubNav />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
					<div className="text-center py-12">
						<HiOutlineExclamationCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
						<h2 className="text-xl font-semibold text-gray-900 mb-2">{'Event not found'}</h2>
						<p className="text-gray-500 mb-4">
							{error != null ? error : 'The event you\'re looking for doesn\'t exist or you don\'t have access to it.'}
						</p>
						<Button onClick={() => window.history.back()}>
							<HiOutlineEye className="h-4 w-4 mr-2" />
							{'Back to Events'}
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />

			<div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
				<div className="space-y-8">
					{/* Hero Section */}
					<div className="text-center py-12">
						<h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
							{event.name}
						</h1>
						<p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
							{event.description}
						</p>
						<div className="flex items-center justify-center gap-4">
							<Badge
								variant={getStatusBadgeVariant(event.status)}
								className="flex items-center gap-2 text-base px-4 py-2"
							>
								{getStatusIcon(event.status)}
								<span className="capitalize font-medium">{event.status}</span>
							</Badge>
							{event.scheduledTime != null && (
								<div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full">
									<HiOutlineCheckCircle className="h-5 w-5" />
									<span className="font-medium">
										{formatRelativeDateLabel(new Date(event.scheduledTime))}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Current User Role Indicator */}
					{currentUser != null && getCurrentUserRole() != null && (
						<Card className="border-0 shadow-md">
							<CardContent className="pt-6">
								<div className="flex items-center justify-center gap-3">
									<div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${getRoleDisplay(getCurrentUserRole()!).bgColor}`}>
										<span className="text-xl">{getRoleDisplay(getCurrentUserRole()!).icon}</span>
										<span className={`font-medium text-lg ${getRoleDisplay(getCurrentUserRole()!).color}`}>
											{'You are a '}{getRoleDisplay(getCurrentUserRole()!).text.toLowerCase()}{' in this event'}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="text-3xl mb-2">{'👥'}</div>
								<div className="text-2xl font-bold text-gray-900">{event.participants.length}</div>
								<div className="text-sm text-gray-500">{'Total Participants'}</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="text-3xl mb-2">{'⏱️'}</div>
								<div className="text-2xl font-bold text-gray-900">
									{Math.round((event.duration || 3600000) / 3600000)}
								</div>
								<div className="text-sm text-gray-500">{'Hours Duration'}</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="text-3xl mb-2">{'📅'}</div>
								<div className="text-2xl font-bold text-gray-900">
									{new Date(event.createdAt).toLocaleDateString()}
								</div>
								<div className="text-sm text-gray-500">{'Created'}</div>
							</CardContent>
						</Card>
					</div>

					{/* Timing Information */}
					<Card className="border-0 shadow-md">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-xl">
								<HiOutlineClock className="h-6 w-6" />
								{'Event Timing'}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="text-sm font-medium text-gray-600 uppercase tracking-wide">{'Time Window'}</label>
									<div className="mt-2 space-y-1">
										<p className="text-gray-900 font-medium">
											{formatFullDateLabel(new Date(event.timeWindow.start))}
										</p>
										<p className="text-gray-900 font-medium">
											{'to '}{formatFullDateLabel(new Date(event.timeWindow.end))}
										</p>
									</div>
								</div>

								{event.scheduledTime != null && (
									<div>
										<label className="text-sm font-medium text-gray-600 uppercase tracking-wide">{'Confirmed Time'}</label>
										<div className="mt-2">
											<p className="text-green-700 font-medium text-lg">
												{formatFullDateLabel(new Date(event.scheduledTime))}
											</p>
											<p className="text-sm text-gray-500">
												{timeUntil(event.scheduledTime)}
											</p>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Participants List */}
					<Card className="border-0 shadow-md">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-xl">
								<HiOutlineUsers className="h-6 w-6" />
								{'Event Members'}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{/* Role breakdown */}
								<div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
									{['creator', 'admin', 'participant'].map(role => {
										const count = event.participants.filter(p => p.role === role).length
										if (count === 0) {
											return null
										}
										const roleInfo = getRoleDisplay(role)
										return (
											<div key={role} className="flex items-center gap-2">
												<span className="text-lg">{roleInfo.icon}</span>
												<span className={`font-medium ${roleInfo.color}`}>
													{count} {role}{count !== 1 ? 's' : ''}
												</span>
											</div>
										)
									})}
								</div>

								{/* Participants list */}
								<div className="space-y-3">
									{event.participants.map((participant) => {
										const roleInfo = getRoleDisplay(participant.role)
										const displayName = getUserDisplayName(participant.userId)
										const isCurrentUser = currentUser?._id === participant.userId

										return (
											<div
												key={participant.userId}
												className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
													isCurrentUser
														? 'bg-indigo-50 border-indigo-200'
														: 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
												}`}
												onClick={() => !isCurrentUser && handleUserClick(participant.userId)}
											>
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
														{displayName.charAt(0).toUpperCase()}
													</div>
													<div>
														<div className="flex items-center gap-3">
															<span className="font-semibold text-gray-900 text-lg">
																{displayName}
															</span>
															{isCurrentUser && (
																<Badge variant="default" className="text-xs">
																	{'You'}
																</Badge>
															)}
														</div>
														<div className="flex items-center gap-2 mt-1">
															<span className="text-lg">{roleInfo.icon}</span>
															<span className={`font-medium ${roleInfo.color}`}>
																{roleInfo.text}
															</span>
														</div>
													</div>
												</div>
												{!isCurrentUser && (
													<div className="text-gray-400 group-hover:text-gray-600">
														<HiOutlineEye className="h-5 w-5" />
													</div>
												)}
											</div>
										)
									})}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* WIP Notice */}
					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl flex items-center gap-3">
								<span className="text-2xl">{'🚧'}</span>
								{'Event Management - Work in Progress'}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
								<h4 className="font-medium text-blue-900 mb-2">{'Coming Soon:'}</h4>
								<ul className="text-sm text-blue-800 space-y-1">
									<li>{'• Participant management and invitations'}</li>
									<li>{'• Time slot selection and voting'}</li>
									<li>{'• Event scheduling and confirmation'}</li>
									<li>{'• Real-time updates and notifications'}</li>
									<li>{'• Event editing and deletion'}</li>
									<li>{'• Availability calendar view'}</li>
									<li>{'• Export to calendar apps'}</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
