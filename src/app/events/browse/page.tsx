'use client'

import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'
import PageHero from '@/components/PageHero'
import { useUser } from '@/contexts/UserProvider'

export default function BrowseEventsPage () {
	const { currentUser } = useUser()
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			{currentUser !== null ? <EventsSubNav /> : null}
			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-10">
				<div className="space-y-8">
					<PageHero
						title="Public Events"
						subtitle="Discover and join events happening in your community."
						className="mb-2"
					/>

					<div className="text-center">
						<p className="text-gray-600 mb-6">{'Coming soon...'}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
