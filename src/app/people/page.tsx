'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Navigation from '@/components/Navigation'
import { Card, CardContent } from '@/components/ui'
import { api } from '@/lib/api'
import { timeSince } from '@/lib/timeUtils'
import { UserType } from '@/types/backendDataTypes'

interface UserWithEventCounts extends UserType {
	eventsCreated?: number
	eventsParticipating?: number
}

function isNewUser (createdAt: string): boolean {
	const daysSince = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))

	return daysSince < 7
}

export default function PeoplePage () {
	const router = useRouter()
	const [users, setUsers] = useState<UserWithEventCounts[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadUsers = async () => {
			try {
				const response = await api.get('/v1/users')
				const usersData = response.data

				const usersWithEvents = await Promise.all(
					usersData.map(async (user: UserType) => {
						try {
							const [createdResponse, memberResponse] = await Promise.all([
								api.get(`/v1/events?createdBy=${user._id}`),
								api.get(`/v1/events?memberOf=${user._id}`)
							])

							const eventsCreated = createdResponse.data.events?.length ?? 0
							const totalMemberEvents = memberResponse.data.events?.length ?? 0
							const eventsParticipating = Math.max(0, totalMemberEvents - eventsCreated)

							return {
								...user,
								eventsCreated,
								eventsParticipating
							}
						} catch {
							return {
								...user,
								eventsCreated: 0,
								eventsParticipating: 0
							}
						}
					})
				)

				setUsers(usersWithEvents)
			} catch (err) {
				console.error('Failed to load users:', err)
				setError('Failed to load users')
			} finally {
				setLoading(false)
			}
		}

		loadUsers()
	}, [])

	const filteredUsers = users.filter(user =>
		user.username.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const handleUserClick = (userId: string) => {
		router.push(`/people/${userId}`)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
					<div className="animate-pulse space-y-8">
						<div className="h-8 bg-gray-200 rounded w-1/4"></div>
						<div className="h-12 bg-gray-200 rounded"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error != null) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
					<Card className="border-0 shadow-lg">
						<CardContent>
							<div className="text-center py-12">
								<div className="text-6xl mb-6">{'❌'}</div>
								<h3 className="text-xl font-medium text-gray-900 mb-3">
									{'Failed to Load Users'}
								</h3>
								<p className="text-gray-600">
									{'Unable to load the people directory. Please try again later.'}
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
						<div className="max-w-3xl">
							<h1 className="text-4xl font-bold mb-3">
								{'People'}
							</h1>
							<p className="text-indigo-100 text-xl mb-8">
								{'Discover and connect with other users on the platform.'}
							</p>
						</div>

						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<span className="text-gray-600 text-lg">{'🔍'}</span>
							</div>
							<input
								type="text"
								placeholder="Search people..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="block w-full pl-10 pr-3 py-3 border border-white border-opacity-50 rounded-lg leading-5 bg-white placeholder-gray-600 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-white"
							/>
						</div>
					</div>

					{filteredUsers.length === 0 ? (
						<Card className="border-0 shadow-md">
							<CardContent>
								<div className="text-center py-12">
									<div className="text-6xl mb-6">{'👥'}</div>
									<h3 className="text-xl font-medium text-gray-900 mb-3">
										{searchTerm ? 'No users found' : 'No users yet'}
									</h3>
									<p className="text-gray-600">
										{searchTerm
											? `No users match "${searchTerm}". Try a different search term.`
											: 'Be the first to join the community!'
										}
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<>
							<div className="flex items-center justify-between">
								<p className="text-gray-600">
									{filteredUsers.length === users.length
										? `${users.length} ${users.length === 1 ? 'person' : 'people'} in the community`
										: `${filteredUsers.length} of ${users.length} people`
									}
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredUsers.map((user) => (
									<Card
										key={user._id}
										className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
										onClick={() => handleUserClick(user._id)}
									>
										<CardContent className="pt-6">
											<div className="text-center">
												<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-md mb-4">
													{user.username.charAt(0).toUpperCase()}
												</div>
												<h3 className="text-lg font-semibold text-gray-900 mb-2">
													{user.username}
												</h3>
												<div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
													<span>{'📅'}</span>
													<span>
														{timeSince(user.createdAt)}
													</span>
												</div>
												<div className="flex justify-center gap-4 text-xs text-gray-400">
													<div className="flex items-center gap-1">
														<span>{'🎯'}</span>
														<span>{user.eventsCreated ?? 0}{' created'}</span>
													</div>
													<div className="flex items-center gap-1">
														<span>{'✅'}</span>
														<span>{user.eventsParticipating ?? 0}{' joined'}</span>
													</div>
													{isNewUser(user.createdAt) && (
														<div className="flex items-center gap-1">
															<span>{'⭐'}</span>
															<span>{'New User'}</span>
														</div>
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
