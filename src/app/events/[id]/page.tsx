'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaUserTie, FaCog, FaUser, FaQuestionCircle, FaUsers, FaCalendarAlt, FaTools, FaClock } from 'react-icons/fa'
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
import PageHero from '@/components/PageHero'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
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
	const { currentUser, userLoading } = useUser()

	const [event, setEvent] = useState<EventType | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [memberNames, setMemberNames] = useState<Map<string, string>>(new Map())

	useEffect(() => {
		const loadEvent = async () => {
			try {
				const response = await api.get<EventType>(`/v1/events/${eventId}`)
				const eventData = response.data
				setEvent(eventData)

				// Load member names
				const names = new Map<string, string>()
				for (const member of eventData.members) {
					try {
						const userResponse = await api.get<UserType>(`/v1/users/${member.userId}`)
						const userData = userResponse.data as UserType
						names.set(member.userId, userData.username)
					} catch (err) {
						console.warn(`Failed to fetch user ${member.userId}:`, err)
						names.set(member.userId, 'Unknown User')
					}
				}
				setMemberNames(names)
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
		return memberNames.get(userId) ?? 'Unknown User'
	}

	const getCurrentUserRole = () => {
		if (currentUser == null || event == null) {
			return null
		}
		const eventUserMember = event.members.find(m => m.userId === currentUser._id)
		return eventUserMember?.role ?? null
	}

	const getRoleDisplay = (role: string) => {
		switch (role) {
			case 'creator':
				return { text: 'Creator', color: 'text-purple-600', icon: <FaUserTie />, bgColor: 'bg-purple-50' }
			case 'admin':
				return { text: 'Admin', color: 'text-blue-600', icon: <FaCog />, bgColor: 'bg-blue-50' }
			case 'participant':
				return { text: 'Participant', color: 'text-green-600', icon: <FaUser />, bgColor: 'bg-green-50' }
			default:
				return { text: 'Unknown', color: 'text-gray-600', icon: <FaQuestionCircle />, bgColor: 'bg-gray-50' }
		}
	}

	const handleUserClick = (userId: string) => {
		router.push(`/people/${userId}`)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				{(userLoading === false && currentUser !== null) ? <EventsSubNav /> : null}
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
					<div className="animate-pulse space-y-6">
						<div className="h-10 bg-gray-200 rounded w-1/3" />
						<div className="h-4 bg-gray-200 rounded w-1/2" />
						<div className="h-64 bg-gray-200 rounded" />
					</div>
				</div>
			</div>
		)
	}

	if ((error != null) || !event) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				{(userLoading === false && currentUser !== null) ? <EventsSubNav /> : null}
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
					<div className="text-center py-12">
						<HiOutlineExclamationCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
						<h2 className="text-xl font-semibold text-gray-900 mb-2">{'Event not found'}</h2>
						<p className="text-gray-500 mb-4">
							{error != null ? error : 'The event you\'re looking for doesn\'t exist or you don\'t have access to it.'}
						</p>
						<Link
							href="/events"
							className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-transparent rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							<HiOutlineEye className="h-4 w-4 mr-2" />
							{'Back to Events'}
						</Link>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			{(userLoading === false && currentUser !== null) ? <EventsSubNav /> : null}

			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
				<div className="space-y-10">
					<PageHero
						title={event.name}
						subtitle={event.description}
					>
						<div className="flex items-center gap-4 mt-4">
							<Badge
								variant={getStatusBadgeVariant(event.status)}
									className="flex items-center gap-2 text-base px-4 py-2 bg-white bg-opacity-20 text-indigo-600 border-white border-opacity-30"
							>
								{getStatusIcon(event.status)}
								<span className="capitalize font-medium">{event.status}</span>
							</Badge>
							{event.scheduledTime != null && (
									<div className="flex items-center gap-2 text-indigo-600 bg-white bg-opacity-20 px-4 py-2 rounded-full border border-white border-opacity-30">
									<HiOutlineCheckCircle className="h-5 w-5" />
									<span className="font-medium">
										{formatRelativeDateLabel(new Date(event.scheduledTime))}
									</span>
								</div>
							)}
						</div>
						{(userLoading === false && currentUser != null && getCurrentUserRole() != null) && (
							<div className="mt-6 flex items-center gap-3">
									<div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30">
									<span className="text-xl text-indigo-600">{getRoleDisplay(getCurrentUserRole()!).icon}</span>
									<span className="font-medium text-lg text-indigo-600">
										{'You are a '}{getRoleDisplay(getCurrentUserRole()!).text.toLowerCase()}{' in this event'}
									</span>
								</div>
							</div>
						)}
					</PageHero>

					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<FaUsers className="text-3xl text-blue-500" />
								</div>
								<div className="text-2xl font-bold text-gray-900">{event.members.length}</div>
								<div className="text-sm text-gray-500">{'Total Members'}</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<FaClock className="text-3xl text-yellow-500" />
								</div>
								<div className="text-2xl font-bold text-gray-900">
									{Math.round((event.duration || 3600000) / 3600000)}
								</div>
								<div className="text-sm text-gray-500">{'Hours Duration'}</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<FaCalendarAlt className="text-3xl text-green-500" />
								</div>
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

					{/* Members List */}
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
										const count = event.members.filter(m => m.role === role).length
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

								{/* Members list */}
								<div className="space-y-3">
									{event.members.map((member) => {
										const roleInfo = getRoleDisplay(member.role)
										const displayName = getUserDisplayName(member.userId)
										const isCurrentUser = currentUser?._id === member.userId

										return (
											<div
												key={member.userId}
												className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${isCurrentUser
														? 'bg-indigo-50 border-indigo-200'
														: 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
													}`}
												onClick={() => !isCurrentUser && handleUserClick(member.userId)}
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
								<span className="text-2xl text-amber-500"><FaTools /></span>
								{'Event Management - Work in Progress'}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
								<h4 className="font-medium text-blue-900 mb-2">{'Coming Soon:'}</h4>
								<ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
									<li>{'Participant management and invitations'}</li>
									<li>{'Time slot selection and voting'}</li>
									<li>{'Event scheduling and confirmation'}</li>
									<li>{'Real-time updates and notifications'}</li>
									<li>{'Event editing and deletion'}</li>
									<li>{'Availability calendar view'}</li>
									<li>{'Export to calendar apps'}</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
