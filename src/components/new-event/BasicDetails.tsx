'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { FaCalendarAlt, FaEdit, FaUsers, FaGlobe } from 'react-icons/fa'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export interface BasicDetailsRef {
	getFormData: () => {
		name: string
		description: string
		visibility: 'draft' | 'public' | 'private'
	}
}

const BasicDetails = forwardRef<BasicDetailsRef>((props, ref) => {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [visibility, setVisibility] = useState<'draft' | 'public' | 'private'>('draft')

	useImperativeHandle(ref, () => ({
		getFormData: () => ({
			name,
			description,
			visibility
		})
	}))

	const visOptions = ['draft', 'private', 'public'] as const
	const visLabel: Record<typeof visOptions[number], string> = {
		draft: 'Draft',
		private: 'Members',
		public: 'Public'
	}
	const visHelp: Record<typeof visOptions[number], string> = {
		draft: 'Only you, creators and admins can view this',
		private: 'Only invited members can view this',
		public: 'Visible to everyone on the internet'
	}

	return (
		<Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg shadow-indigo-200/30 scroll-mt-24" id="basic-details-section">
			<CardHeader>
				<CardTitle className="flex items-center gap-3 text-3xl font-bold text-gray-800">
					<FaCalendarAlt /> <span>{'Event Details'}</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="space-y-6">
					<div>
						<label className="block text-base font-semibold text-gray-700 mb-2" htmlFor="event-name">{'Event Name'}</label>
						<input
							id="event-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="My Creatively-Named Event"
							className="mt-1 w-full rounded-lg border-gray-300 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
						/>
					</div>
					<div>
						<span className="block text-base font-semibold text-gray-700 mb-2">{'Visibility'}</span>
						<div className="flex justify-start">
							<div className="inline-flex items-center rounded-xl gap-1 border border-gray-200 bg-gray-100/60 p-1 shadow-inner overflow-hidden">
								{visOptions.map((v) => (
									<button
										key={v}
										type="button"
										onClick={() => setVisibility(v)}
										className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${visibility === v ? 'bg-white text-indigo-700 shadow-md' : 'text-gray-500 hover:bg-white/50 hover:text-gray-800'}`}
										aria-label={`${visLabel[v]} visibility`}
									>
										{v === 'draft' && <FaEdit className="text-base" />}
										{v === 'public' && <FaGlobe className="text-base" />}
										{v === 'private' && <FaUsers className="text-base" />}
										{visLabel[v]}
									</button>
								))}
							</div>
						</div>
						<p className="mt-2 text-xs text-gray-500 h-4">{visHelp[visibility]}</p>
					</div>

					<div className="md:col-span-2">
						<label className="block text-base font-semibold text-gray-700 mb-2" htmlFor="event-description">{'Description'}</label>
						<textarea
							id="event-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={6}
							placeholder="Make all your guests excited!"
							className="mt-1 w-full rounded-lg border-gray-300 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
})

BasicDetails.displayName = 'BasicDetails'
export default BasicDetails
