'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { api } from '@/lib/api'
import { timeSince } from '@/lib/timeUtils'
import { UserType } from '@/types/backendDataTypes'

interface UserStats {
	eventsCreated: number
	eventsParticipating: number
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

		if (userId) {
			loadUser()
		}
	}, [userId])

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
								<div className="text-6xl mb-6">{'❌'}</div>
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
								<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold shadow-lg">
									{user.username.charAt(0).toUpperCase()}
								</div>
								<div>
									<h1 className="text-4xl font-bold mb-2">
										{user.username}
									</h1>
									<div className="flex items-center gap-2 text-indigo-100">
										<span>{'📅'}</span>
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
									<div className="text-3xl">{'👋'}</div>
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
											<span className="text-xs">{'→'}</span>
										</Link>
									</div>
								</div>
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="text-3xl mb-2">{'🎯'}</div>
								<div className="text-2xl font-bold text-gray-900">{userStats.eventsCreated}</div>
								<div className="text-sm text-gray-500">{'Events Created'}</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								<div className="text-3xl mb-2">{'✅'}</div>
								<div className="text-2xl font-bold text-gray-900">{userStats.eventsParticipating}</div>
								<div className="text-sm text-gray-500">{'Events Joined'}</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-md text-center">
							<CardContent className="pt-6">
								{isNewUser(user.createdAt) ? (
									<>
										<div className="text-3xl mb-2">{'⭐'}</div>
										<div className="text-2xl font-bold text-gray-900">{'New User'}</div>
										<div className="text-sm text-gray-500">{'Member Status'}</div>
									</>
								) : (
									<>
										<div className="text-3xl mb-2">{'👤'}</div>
										<div className="text-2xl font-bold text-gray-900">{getMemberStatus(user.createdAt)}</div>
										<div className="text-sm text-gray-500">{'Member Status'}</div>
									</>
								)}

							</CardContent>
						</Card>
					</div>

					{/* Coming Soon */}
					<Card className="border-0 shadow-md">
						<CardHeader>
							<CardTitle className="text-xl flex items-center gap-3">
								<span className="text-xl">{'🚀'}</span>
								{'More Coming Soon'}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
								<div className="flex items-center gap-2">
									<span>{'📊'}</span>
									{'Activity insights'}
								</div>
								<div className="flex items-center gap-2">
									<span>{'🏆'}</span>
									{'Achievement badges'}
								</div>
								<div className="flex items-center gap-2">
									<span>{'🤝'}</span>
									{'Events in common'}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
