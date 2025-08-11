'use client'

import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'
import { useUser } from '@/contexts/UserProvider'

export default function BrowseEventsPage () {
	const { currentUser } = useUser()
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			{currentUser !== null ? <EventsSubNav /> : null}
			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-10">
				<div className="space-y-8">
					{/* Header */}
					<div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
						<div className="max-w-4xl">
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
								{'Public Events'}
							</h1>
							<p className="text-indigo-100 text-lg sm:text-xl">
								{'Discover and join events happening in your community.'}
							</p>
						</div>
					</div>

					<div className="text-center">
						<p className="text-gray-600 mb-6">{'Coming soon...'}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
