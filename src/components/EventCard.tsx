'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo, useRef } from 'react'
import { FaUserTie, FaCog, FaUser, FaQuestionCircle, FaEdit, FaGlobe, FaLock, FaExternalLinkAlt } from 'react-icons/fa'

import { Badge, Card, CardContent } from '@/components/ui'
import { api } from '@/lib/api'
import { timeSince, timeUntil } from '@/lib/timeUtils'
import { type EventType } from '@/types/backendDataTypes'

interface EventCardProps {
	event: EventType
	currentUser?: { _id: string } | null
	userNames?: Map<string, string>
}

export function EventCard ({ event, currentUser = null, userNames }: EventCardProps) {
	const [creatorNamesState, setCreatorNamesState] = useState<Map<string, string>>(new Map())
	const [showMoreCreators, setShowMoreCreators] = useState(false)
	const [creatorsHover, setCreatorsHover] = useState(false)
	const rootRef = useRef<HTMLDivElement | null>(null)

	const getUserRole = () => {
		const member = event.members.find(m => m.userId === currentUser?._id)
		return member?.role || 'unknown'
	}

	const creators = useMemo(() => event.members.filter(m => m.role === 'creator'), [event.members])

	const getCreatorNameImmediate = (id: string) => {
		if (id === currentUser?._id) { return 'you' }
		if (userNames && userNames.has(id)) { return userNames.get(id) as string }
		if (creatorNamesState.has(id)) { return creatorNamesState.get(id) as string }
		return 'Loading...'
	}

	useEffect(() => {
		if (creators.length === 0) { return }
		const missing = creators.filter(c => !((userNames && userNames.has(c.userId)) || creatorNamesState.has(c.userId)))
		if (missing.length === 0) { return }
		let cancelled = false
		;(async () => {
			const updates = new Map<string, string>()
			for (const c of missing) {
				try {
					const res = await api.get(`/v1/users/${c.userId}`)
					if (cancelled) { return }
					const data = res.data as { username?: string; email?: string }
					updates.set(c.userId, data.username ?? data.email ?? 'Unknown User')
				} catch {
					if (!cancelled) { updates.set(c.userId, 'Unknown User') }
				}
			}
			if (!cancelled && updates.size > 0) {
				setCreatorNamesState(prev => new Map([...prev, ...Array.from(updates.entries())]))
			}
		})()
		return () => { cancelled = true }
	}, [creators, creatorNamesState, userNames])

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

	const eventTime = event.scheduledTime !== null && event.scheduledTime !== undefined
		? new Date(event.scheduledTime)
		: new Date(event.timeWindow.end)
	const isUpcoming = eventTime.getTime() > Date.now()
	const userRole = getUserRole()
	const roleDisplay = getRoleDisplay(userRole)
	const firstCreatorName = creators.length > 0 ? getCreatorNameImmediate(creators[0].userId) : null

	useEffect(() => {
		if (!showMoreCreators) { return }
		const handle = (e: MouseEvent) => {
			if (!rootRef.current) { return }
			if (e.target instanceof HTMLElement && rootRef.current.contains(e.target)) {
				if (e.target.closest('.eventCard-creators-toggle') || e.target.closest('.eventCard-creators-dropdown')) { return }
			}
			setShowMoreCreators(false)
		}
		document.addEventListener('mousedown', handle)
		return () => document.removeEventListener('mousedown', handle)
	}, [showMoreCreators])

	return (
		<div
			ref={rootRef}
			className="eventCard-root group block h-full focus:outline-none cursor-pointer"
			onClick={e => {
				if (showMoreCreators) { setShowMoreCreators(false) }
				if (e.target instanceof HTMLElement && e.target.closest('.eventCard-user-link,.eventCard-popOut')) { return }
				window.location.href = `/events/${event._id}`
			}}
		>
			<Card className={`border-0 shadow-md h-full transition-shadow duration-200 ${!creatorsHover ? 'group-hover:shadow-lg' : ''}`}>
				<CardContent className="flex flex-col h-full relative">
					<button
						type="button"
						tabIndex={0}
						aria-label="View Details"
						onClick={e => { e.stopPropagation(); e.preventDefault(); window.location.href = `/events/${event._id}` }}
						className={`eventCard-popOut absolute top-2 right-2 z-10 p-1 transition-colors cursor-pointer ${!creatorsHover ? 'text-gray-400 group-hover:text-indigo-600' : 'text-gray-400'}`}
						style={{ background: 'none', border: 'none' }}
					>
						<FaExternalLinkAlt size={16} />
					</button>
					<div className="pt-2 mb-4">
						<div className="w-full px-0">
							<h3
								className="font-semibold text-gray-900 text-xl mb-1 truncate block"
								style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
								title={event.name}
							>
								{event.name}
							</h3>
						</div>
						{creators.length > 0 && (
							<div
								className="inline-flex items-baseline gap-1 text-sm mb-2 relative z-20 select-none"
								onClick={e => e.stopPropagation()}
								onMouseEnter={() => setCreatorsHover(true)}
								onMouseLeave={() => setCreatorsHover(false)}
							>
								<Link href={`/people/${creators[0].userId}`} className="eventCard-user-link text-gray-500 underline hover:text-indigo-600 hover:decoration-indigo-500 transition-colors cursor-pointer" tabIndex={0}>
									{'by '}{firstCreatorName}
								</Link>
								{creators.length > 1 && (
									<button
										type="button"
										className="eventCard-creators-toggle text-gray-500 hover:text-indigo-600 underline focus:outline-none text-xs leading-snug cursor-pointer active:opacity-70 transition-colors"
										onClick={e => { e.stopPropagation(); setShowMoreCreators(v => !v) }}
									>
										{'and '}{creators.length - 1}{creators.length - 1 === 1 ? ' other' : ' others'}
									</button>
								)}
								{showMoreCreators && creators.length > 1 && (
									<div className="eventCard-creators-dropdown absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-30 w-48" onClick={e => e.stopPropagation()}>
										<ul className="space-y-1">
											{creators.slice(1).map(c => (
												<li key={c.userId}>
													<Link
														href={`/people/${c.userId}`}
														className="block w-full truncate text-gray-600 hover:text-indigo-600 underline transition-colors"
														title={getCreatorNameImmediate(c.userId)}
														onClick={e => e.stopPropagation()}
													>
														{getCreatorNameImmediate(c.userId)}
													</Link>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}
						<p className="text-sm text-gray-600 mb-4 overflow-hidden" style={{ minHeight: '2.5rem', maxHeight: '2.5rem' }}>
							{event.description}
						</p>
					</div>
					<div className="space-y-3 text-sm text-gray-600 flex-1">
						{event.status === 'cancelled' && (
							<div className="flex items-center gap-2">
								<Badge className="bg-red-100 text-red-800 text-xs" title="Cancelled – this event will not take place">
									{'Cancelled'}
								</Badge>
							</div>
						)}
						{event.status !== 'cancelled' && event.status === 'confirmed' && event.scheduledTime != null ? (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge className="bg-green-100 text-green-800 text-xs" title="The date has been confirmed and is visible to all members">
										{'Confirmed'}
									</Badge>
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
						) : event.status !== 'cancelled' ? (
							<div className="flex items-center gap-2">
								<Badge className="bg-gray-100 text-gray-800 text-xs" title="Current availability range – final date not yet confirmed">
									{'Window'}
								</Badge>
								<span className="font-medium">
									{new Date(event.timeWindow.start).toLocaleDateString()}{' - '}{new Date(event.timeWindow.end).toLocaleDateString()}
								</span>
							</div>
						) : null}
						{event.status !== 'cancelled' && (
							<div className="flex items-center gap-2">
								<Badge className="bg-gray-100 text-gray-800 text-xs" title="Number of people in this event">
									{'Members'}
								</Badge>
								<span className="font-medium">{event.members.length}</span>
							</div>
						)}
					</div>
					<div className="flex-grow" />
					<div className="mt-4 pt-3 border-t border-gray-100">
						<div className="flex justify-between items-start mb-3">
							<span className="text-xs text-gray-500">
								{'Updated '}{timeSince(event.updatedAt)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2 flex-wrap">
								{event.visibility && (
									<Badge className={`text-xs ${event.visibility === 'public' ? 'bg-blue-100 text-blue-800' : event.visibility === 'private' ? 'bg-gray-200 text-gray-700' : 'bg-amber-100 text-amber-700'}`} title={event.visibility === 'public' ? 'Visible to anyone browsing events' : event.visibility === 'private' ? 'Only visible to members of this event' : 'Draft – only creators/admins can see it'}>
										<span className="inline mr-1">{event.visibility === 'public' ? <FaGlobe className="text-blue-500" /> : event.visibility === 'private' ? <FaLock className="text-gray-500" /> : <FaEdit className="text-amber-500" />}</span> {event.visibility === 'draft' ? 'Draft' : event.visibility === 'public' ? 'Public' : 'Private'}
									</Badge>
								)}
								{roleDisplay.showRole && (
									<Badge className="text-xs bg-purple-100 text-purple-800" title={`Your role: ${roleDisplay.text}`}>
										<span className="inline mr-1">{roleDisplay.icon}</span> {roleDisplay.text}
									</Badge>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default EventCard
