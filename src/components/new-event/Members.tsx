'use client'

import React, { useCallback, useMemo } from 'react'
import { FaTrash, FaUserMinus, FaUserPlus, FaUsers } from 'react-icons/fa'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import UserAvatar from '@/components/UserAvatar'
import { type UserType } from '@/types/backendDataTypes'
import { type Member } from '@/types/newEvent'

function MembersSection ({
  allUsers, members, setMembers,
  memberSearch, setMemberSearch,
  currentUser
}: {
  allUsers: UserType[]
  members: Member[]
  setMembers: (members: Member[] | ((prev: Member[]) => Member[])) => void
  memberSearch: string
  setMemberSearch: (search: string) => void
  currentUser: UserType | null
}) {
  const filteredUsers = useMemo(() => allUsers.filter(user =>
    !members.some(m => m.userId === user._id) &&
    user.username.toLowerCase().includes(memberSearch.toLowerCase())
  ), [allUsers, members, memberSearch])

  const toggleMember = useCallback((user: UserType) => {
    setMembers((prev: Member[]) => {
      const existing = prev.find((m: Member) => m.userId === user._id)
      if (existing) {
        if (currentUser && user._id === currentUser._id) { return prev }
        return prev.filter((m: Member) => m.userId !== user._id)
      }
      return [...prev, { userId: user._id, role: 'participant' }]
    })
  }, [setMembers, currentUser])

  const updateMemberRole = useCallback((userId: string, role: Member['role']) => {
    if (currentUser && userId === currentUser._id) { return }
    setMembers((prev: Member[]) => prev.map((m: Member) => m.userId === userId ? { ...m, role } : m))
  }, [setMembers, currentUser])

  const getUserById = useCallback((userId: string) => allUsers.find(u => u._id === userId) || currentUser, [allUsers, currentUser])

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
          {members.map(member => {
            const user = getUserById(member.userId)
            const isCurrentUser = Boolean(currentUser && member.userId === currentUser._id)
            const displayName = user?.username ?? member.userId

            return (
              <div key={member.userId} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <UserAvatar username={displayName} size="sm" />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm font-medium truncate flex items-center gap-1">
                    {displayName}
                    {isCurrentUser && (
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 tracking-tight">
                        {'That\'s you!'}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCurrentUser ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 whitespace-nowrap">
                      {'Creator'}
                    </span>
                  ) : (
                    <div className="flex gap-1 whitespace-nowrap">
                      {(['creator', 'admin', 'participant'] as const).map(roleOption => (
                        <button
                          key={roleOption}
                          type="button"
                          onClick={() => updateMemberRole(member.userId, roleOption)}
                          className={`text-[10px] px-2 py-1 rounded border transition ${member.role === roleOption
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-indigo-50'
                          }`}
                        >
                          {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                  {!isCurrentUser && (
                    <button
                      type="button"
                      onClick={() => setMembers(members.filter(m => m.userId !== member.userId))}
                      className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center gap-1 shadow-sm transition-colors whitespace-nowrap"
                      aria-label={`Remove ${displayName} from members`}
                    >
                      <FaTrash className="text-[10px]" /> {'Remove'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {members.length === 0 && <p className="text-xs text-gray-400">{'No members yet.'}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

const MemoizedMembers = React.memo(MembersSection, (prev, next) => {
  if (prev.currentUser?._id !== next.currentUser?._id) { return false }
  if (prev.memberSearch !== next.memberSearch) { return false }
  if (prev.allUsers.length !== next.allUsers.length) { return false }
  if (prev.members.length !== next.members.length) { return false }
  for (let i = 0; i < prev.members.length; i++) {
    const a = prev.members[i]; const b = next.members[i]
    if (a.userId !== b.userId || a.role !== b.role) { return false }
  }
  return true
})

export default MemoizedMembers
