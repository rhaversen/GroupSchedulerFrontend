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
		private: 'Members only',
		public: 'Public'
	}
	const visHelp: Record<typeof visOptions[number], string> = {
		draft: 'Only visible to creators and admins',
		private: 'Only visible to invited members',
		public: 'Visible to the entire internet'
	}

	return (
		<Card className="border-0 shadow-md scroll-mt-24" id="basic-details-section">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FaCalendarAlt /> {'Basic details'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 lg:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-gray-700" htmlFor="event-name">{'Event Name'}</label>
						<input
							id="event-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
						/>
					</div>
					<div>
						<span className="block text-sm font-medium text-gray-700">{'Visibility'}</span>
						<div className="mt-1 flex justify-start">
							<div className="inline-flex items-center rounded-lg gap-1 border border-gray-300 bg-white px-1 py-0 shadow-sm overflow-hidden">
								{visOptions.map((v) => (
									<button
										key={v}
										type="button"
										onClick={() => setVisibility(v)}
										className={`flex items-center gap-2 px-3 py-1 my-1 text-sm rounded-lg transition ${visibility === v ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
										aria-label={`${visLabel[v]} visibility`}
									>
										{v === 'draft' && <FaEdit className="text-xs" />}
										{v === 'public' && <FaGlobe className="text-xs" />}
										{v === 'private' && <FaUsers className="text-xs" />}
										{visLabel[v]}
									</button>
								))}
							</div>
						</div>
						<p className="mt-1 text-xs text-gray-500">{visHelp[visibility]}</p>
					</div>

					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700" htmlFor="event-description">{'Description'}</label>
						<textarea
							id="event-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={8}
							className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
})

BasicDetails.displayName = 'BasicDetails'
export default BasicDetails
