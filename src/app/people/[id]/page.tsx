'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaTimes, FaCalendarAlt, FaHandPaper, FaBullseye, FaCheckCircle, FaUser, FaSearch, FaRocket, FaChartBar, FaTrophy, FaChartLine, FaStar, FaArrowRight } from 'react-icons/fa'

import { EventCard } from '@/components/EventCard'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import UserAvatar from '@/components/UserAvatar'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { timeSince } from '@/lib/timeUtils'
import { EventType, UserType } from '@/types/backendDataTypes'

interface UserStats {
	eventsCreated: number
	eventsParticipating: number
}

interface CommonEventsData {
	events: EventType[]
	userNames: Map<string, string>
}

function isNewUser (createdAt: string): boolean {
	const daysSince = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))

	return daysSince < 7
}

function getMemberStatus (createdAt: string): string {
	const daysSince = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))

	if (daysSince < 30) { return 'Newcomer' }
	if (daysSince < 90) { return 'Member' }
	if (daysSince < 365) { return 'Active' }
	if (daysSince < 730) { return 'Veteran' }

	return 'Legend'
}

export default function UserProfilePage () {
	const params = useParams()
	const userId = params.id as string
	const { currentUser } = useUser()

	const [user, setUser] = useState<UserType | null>(null)
	const [userStats, setUserStats] = useState<UserStats>({ eventsCreated: 0, eventsParticipating: 0 })
	const [commonEvents, setCommonEvents] = useState<CommonEventsData>({ events: [], userNames: new Map() })
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const isCurrentUser = currentUser?._id === userId

	useEffect(() => {
		const loadUser = async () => {
			try {
				const response = await api.get(`/v1/users/${userId}`)
				setUser(response.data)

				try {
					const [createdResponse, memberResponse] = await Promise.all([
						api.get(`/v1/events?createdBy=${userId}`),
						api.get(`/v1/events?memberOf=${userId}`)
					])

					const eventsCreated = createdResponse.data.events?.length ?? 0
					const totalMemberEvents = memberResponse.data.events?.length ?? 0
					const eventsParticipating = Math.max(0, totalMemberEvents - eventsCreated)

					setUserStats({
						eventsCreated,
						eventsParticipating
					})

					// Load common events if current user exists and it's not their own profile
					if (currentUser && !isCurrentUser) {
						await loadCommonEvents(memberResponse.data.events ?? [])
					}
				} catch {
					setUserStats({ eventsCreated: 0, eventsParticipating: 0 })
				}
			} catch (err) {
				console.error('Failed to load user:', err)
				setError('Failed to load user profile')
			} finally {
				setLoading(false)
			}
		}

		const loadCommonEvents = async (viewedUserEvents: EventType[]) => {
			try {
				// Get current user's events
				const currentUserEventsResponse = await api.get(`/v1/events?memberOf=${currentUser?._id}`)
				const currentUserEvents = currentUserEventsResponse.data.events ?? []

				// Find events in common (by event ID)
				const viewedUserEventIds = new Set(viewedUserEvents.map(event => event._id))
				const eventsInCommon = currentUserEvents.filter((event: EventType) =>
					viewedUserEventIds.has(event._id)
				)

				// Get user names for all participants in common events
				const allUserIds = new Set<string>()
				eventsInCommon.forEach((event: EventType) => {
					event.members.forEach(member => allUserIds.add(member.userId))
				})

				const userNames = new Map<string, string>()
				if (allUserIds.size > 0) {
					const userPromises = Array.from(allUserIds).map(async (id) => {
						try {
							const userResponse = await api.get(`/v1/users/${id}`)
							return { id, username: userResponse.data.username }
						} catch {
							return { id, username: 'Unknown User' }
						}
					})

					const users = await Promise.all(userPromises)
					users.forEach(({ id, username }) => {
						userNames.set(id, username)
					})
				}

				setCommonEvents({ events: eventsInCommon, userNames })
			} catch (err) {
				console.error('Failed to load common events:', err)
				setCommonEvents({ events: [], userNames: new Map() })
			}
		}

		if (userId) {
			loadUser()
		}
	}, [userId, currentUser, isCurrentUser])

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
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

	if ((error != null) || !user) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
					<Card className="border-0 shadow-lg">
						<CardContent>
							<div className="text-center py-12">
								<div className="flex justify-center mb-6">
									<FaTimes className="text-6xl text-red-400" />
								</div>
								<h3 className="text-xl font-medium text-gray-900 mb-3">
									{'User Not Found'}
								</h3>
								<p className="text-gray-600 mb-6">
									{(error != null) || 'The user profile you\'re looking for doesn\'t exist.'}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />

			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
				<div className="space-y-10">
					{/* Header */}
					<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-10 text-white">
						<div className="max-w-3xl mb-6">
							<div className="flex items-center gap-6">
								<UserAvatar username={user.username} variant="white" size="lg" className="shadow-lg" />
								<div className="flex-1 min-w-0">
									<h1
										className="text-4xl font-bold mb-2 truncate"
										title={user.username}
									>
										{user.username}
									</h1>
									<div className="flex items-center gap-2 text-indigo-100">
										<span><FaCalendarAlt /></span>
										<span className="text-lg">
											{timeSince(user.createdAt)}
										</span>
									</div>
								</div>
							</div>
						</div>
						{isCurrentUser && (
							<div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-50 shadow-lg">
								<div className="flex items-start gap-4">
									<div className="text-3xl text-amber-500"><FaHandPaper /></div>
									<div className="flex-1">
										<div className="text-indigo-800 font-semibold text-lg mb-1">
											{'Hey, that\'s you!'}
										</div>
										<div className="text-indigo-700 text-sm mb-3">
											{'You\'re viewing your own public profile'}
										</div>
										<Link
											href="/profile"
											className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-200 hover:underline"
										>
											<span>{'Go to My Profile'}</span>
											<span className="text-xs"><FaArrowRight /></span>
										</Link>
									</div>
								</div>
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<FaBullseye className="text-3xl text-indigo-600" />
								</div>
								<div className="text-2xl font-bold text-gray-900">{userStats.eventsCreated}</div>
								<div className="text-sm text-gray-500">{'Events Created'}</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<FaCheckCircle className="text-3xl text-green-500" />
								</div>
								<div className="text-2xl font-bold text-gray-900">{userStats.eventsParticipating}</div>
								<div className="text-sm text-gray-500">{'Events Joined'}</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								{isNewUser(user.createdAt) ? (
									<>
										<div className="flex justify-center mb-2">
											<FaStar className="text-3xl text-yellow-500" />
										</div>
										<div className="text-2xl font-bold text-gray-900">{'New User'}</div>
										<div className="text-sm text-gray-500">{'Member Status'}</div>
									</>
								) : (
									<>
										<div className="flex justify-center mb-2">
											<FaUser className="text-3xl text-blue-500" />
										</div>
										<div className="text-2xl font-bold text-gray-900">{getMemberStatus(user.createdAt)}</div>
										<div className="text-sm text-gray-500">{'Member Status'}</div>
									</>
								)}

							</CardContent>
						</Card>
					</div>

					{/* Events in Common */}
					{currentUser && !isCurrentUser && (
						<Card className="border-0 shadow-md">
							<CardHeader>
								<CardTitle className="text-xl flex items-center gap-3">
									<span className="text-xl">{'🤝'}</span>
									{`Events in Common with ${user.username}`}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{commonEvents.events.length > 0 ? (
									<div className="space-y-4">
										<p className="text-sm text-gray-600 mb-4">
											{`You and ${user.username} are both participating in ${commonEvents.events.length} event${commonEvents.events.length === 1 ? '' : 's'}.`}
										</p>
										<div className="grid gap-4">
											{commonEvents.events.map(event => (
												<EventCard
													key={event._id}
													event={event}
													currentUser={currentUser}
													userNames={commonEvents.userNames}
												/>
											))}
										</div>
									</div>
								) : (
									<div className="text-center py-8">
										<div className="flex justify-center mb-4">
											<FaSearch className="text-4xl text-gray-400" />
										</div>
										<p className="text-gray-600">
											{`You and ${user.username} don't have any events in common yet.`}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Coming Soon */}
					<Card className="border-0 shadow-md">
						<CardHeader>
							<CardTitle className="text-xl flex items-center gap-3">
								<span className="text-xl text-purple-500"><FaRocket /></span>
								{'More Coming Soon'}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
								<div className="flex items-center gap-2">
									<span><FaChartBar /></span>
									{'Activity insights'}
								</div>
								<div className="flex items-center gap-2">
									<span><FaTrophy /></span>
									{'Achievement badges'}
								</div>
								<div className="flex items-center gap-2">
									<span><FaChartLine /></span>
									{'Detailed statistics'}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
