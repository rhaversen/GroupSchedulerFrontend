'use client'

import { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from 'react'
import { FaUsers, FaUserPlus, FaUserMinus, FaTrash, FaSort, FaDivide, FaCheck, FaTimes } from 'react-icons/fa'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import UserAvatar from '@/components/UserAvatar'
import { type UserType } from '@/types/backendDataTypes'
import { type Member } from '@/types/newEvent'

export interface MembersRef {
	getFormData: () => {
		members: Member[]
	}
}

const Members = forwardRef<MembersRef, {
	allUsers: UserType[]
	currentUser: UserType
}>((props, ref) => {
	const { allUsers, currentUser } = props

	const [members, setMembers] = useState<Member[]>([])
	const [memberSearch, setMemberSearch] = useState('')
	const [sortBy, setSortBy] = useState<'name' | 'role'>('name')
	const [showConfirmRemoveAll, setShowConfirmRemoveAll] = useState(false)

	useImperativeHandle(ref, () => ({
		getFormData: () => ({
			members
		})
	}))

	// Initialize current user as creator
	useEffect(() => {
		if (currentUser?._id && !members.some(m => m.userId === currentUser._id)) {
			setMembers([{ userId: currentUser._id, role: 'creator' }])
		}
	}, [currentUser, members])

	const addMember = (userId: string) => {
		if (!members.some(m => m.userId === userId)) {
			setMembers([...members, { userId, role: 'participant' }])
		}
		setMemberSearch('')
	}

	const removeMember = (userId: string) => {
		setMembers(members.filter(m => m.userId !== userId))
	}

	const updateMemberRole = (userId: string, role: Member['role']) => {
		setMembers(members.map(m => m.userId === userId ? { ...m, role } : m))
	}

	const filteredUsers = allUsers.filter(user => {
		const isNotMember = !members.some(m => m.userId === user._id)
		const nameMatch = user.username?.toLowerCase().includes(memberSearch.toLowerCase()) ?? false
		const emailMatch = user.email?.toLowerCase().includes(memberSearch.toLowerCase()) ?? false
		return Boolean(isNotMember && (nameMatch || emailMatch))
	})

	const toggleMember = (user: UserType) => {
		const inMembers = members.some(m => m.userId === user._id)
		if (inMembers) {
			if (user._id === currentUser._id) { return }
			removeMember(user._id)
		} else {
			addMember(user._id)
		}
	}

	const removeAllMembers = () => {
		setMembers(members.filter(m => m.userId === currentUser._id))
		setShowConfirmRemoveAll(false)
	}

	const sortedMembers = useMemo(() => {
		const membersWithUsers = members
			.filter(member => member.userId !== currentUser._id)
			.map(member => ({
				...member,
				user: allUsers.find(u => u._id === member.userId)
			})).filter(m => m.user)

		if (sortBy === 'name') {
			return membersWithUsers.sort((a, b) =>
				a.user!.username.localeCompare(b.user!.username)
			)
		}

		const roleOrder = { creator: 0, admin: 1, participant: 2 }
		return membersWithUsers.sort((a, b) => {
			const roleComparison = roleOrder[a.role] - roleOrder[b.role]
			if (roleComparison !== 0) { return roleComparison }
			return a.user!.username.localeCompare(b.user!.username)
		})
	}, [members, allUsers, sortBy, currentUser._id])

	const currentUserMember = members.find(m => m.userId === currentUser._id)

	return (
		<Card className="border-0 shadow-md scroll-mt-24" id="members-section">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FaUsers /> {'Members'}
				</CardTitle>
				<p className="mt-2 text-xs text-gray-500 leading-relaxed">
					{'Creators and Admins can modify event details, add or remove members. Only Creators can promote members to Admin or Creator roles.'}
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex flex-col gap-2">
					<input
						placeholder="Search users"
						value={memberSearch}
						onChange={(e) => setMemberSearch(e.target.value)}
						className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
					/>
					<div className="grid md:grid-cols-3 gap-2 max-h-64 overflow-auto p-2 border border-gray-200 rounded-lg bg-white shadow-inner">
						{filteredUsers.map(user => {
							const inMembers = members.some(m => m.userId === user._id)
							return (
								<button
									key={user._id}
									type="button"
									onClick={() => toggleMember(user)}
									className={`group text-left px-3 py-2 rounded-lg text-sm border flex items-center gap-2 transition shadow-sm ${inMembers
										? 'border-indigo-300 bg-indigo-50/70 text-indigo-700'
										: 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/60'
										}`}
									aria-label={`${inMembers ? 'Remove' : 'Add'} ${user.username} as member`}
								>
									<UserAvatar username={user.username} size="sm" className="shadow-inner" />
									<span className="flex-1 truncate text-xs">{user.username}</span>
									{inMembers ? (
										<FaUserMinus className="text-xs text-indigo-600 group-hover:scale-110 transition-transform" />
									) : (
										<FaUserPlus className="text-xs text-indigo-600 group-hover:scale-110 transition-transform" />
									)}
								</button>
							)
						})}
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-medium text-gray-700">{'Current members'}</h4>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<FaSort className="text-xs text-gray-400" />
								<div className="flex gap-1">
									{(['name', 'role'] as const).map(sortOption => (
										<button
											key={sortOption}
											type="button"
											onClick={() => setSortBy(sortOption)}
											className={`text-xs px-2 py-1 rounded border transition ${sortBy === sortOption
												? 'bg-indigo-600 text-white border-indigo-600'
												: 'bg-white text-gray-600 border-gray-300 hover:bg-indigo-50'
												}`}
										>
											{sortOption === 'name' ? 'Name' : 'Role'}
										</button>
									))}
								</div>
							</div>
							{sortedMembers.length > 0 && (
								<button
									type="button"
									onClick={() => setShowConfirmRemoveAll(true)}
									className="text-xs px-3 py-1 rounded-md border bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200 flex items-center gap-1 shadow-sm transition-colors"
								>
									<FaTrash className="text-xs" /> {'Remove All Members\r'}
								</button>
							)}
						</div>
					</div>

					{showConfirmRemoveAll && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-3">
							<p className="text-sm text-red-800 mb-3">{'Are you sure you want to remove all members except yourself?'}</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={removeAllMembers}
									className="text-xs px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
								>
									<FaCheck className="text-xs" /> {'Yes, Remove All\r'}
								</button>
								<button
									type="button"
									onClick={() => setShowConfirmRemoveAll(false)}
									className="text-xs px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 flex items-center gap-1"
								>
									<FaTimes className="text-xs" /> {'Cancel\r'}
								</button>
							</div>
						</div>
					)}

					{currentUserMember && (
						<div className="flex items-center gap-3 rounded-lg border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-3 shadow-md">
							<UserAvatar username={currentUser.username} size="sm" className="ring-2 ring-indigo-200" />
							<div className="flex-1 min-w-0 flex items-center gap-2">
								<span className="text-sm font-semibold truncate flex items-center gap-2 text-indigo-900">
									{currentUser.username}
									<span className="text-xs font-medium px-3 py-1 rounded bg-indigo-100 text-indigo-700 border border-indigo-300">
										{'You (Creator)'}
									</span>
								</span>
							</div>
						</div>
					)}

					{sortedMembers.map(({ user, userId, role }) => {
						if (!user) { return null }

						const displayName = user.username

						return (
							<div key={userId} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
								<UserAvatar username={displayName} size="sm" />
								<div className="flex-1 min-w-0 flex items-center gap-2">
									<span className="text-sm font-medium truncate">
										{displayName}
									</span>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<div className="flex gap-1 whitespace-nowrap">
										{(['creator', 'admin', 'participant'] as const).map(roleOption => (
											<button
												key={roleOption}
												type="button"
												onClick={() => updateMemberRole(userId, roleOption)}
												className={`text-sm px-3 py-1.5 rounded border transition ${role === roleOption
													? 'bg-indigo-600 text-white border-indigo-600'
													: 'bg-white text-gray-600 border-gray-300 hover:bg-indigo-50'
													}`}
											>
												{roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
											</button>
										))}
									</div>
									<button
										type="button"
										onClick={() => removeMember(userId)}
										className="text-sm p-1.5 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 shadow-sm transition-colors"
										aria-label={`Remove ${displayName} from members`}
									>
										<FaDivide className="text-xs" />
									</button>
								</div>
							</div>
						)
					})}
					{members.length === 0 && <p className="text-xs text-gray-400">{'No members yet.'}</p>}
				</div>
			</CardContent>
		</Card>
	)
})

Members.displayName = 'Members'
export default Members
