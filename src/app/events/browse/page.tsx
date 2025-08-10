import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'

export default function BrowseEventsPage () {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
				<div className="space-y-8">
					{/* Header */}
					<div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
						<div className="max-w-4xl">
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
								{'Public Events'}
							</h1>
							<p className="text-indigo-100 text-lg sm:text-xl mb-6 sm:mb-8">
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
