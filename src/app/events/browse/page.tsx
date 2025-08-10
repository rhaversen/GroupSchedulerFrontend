import EventsSubNav from '@/components/EventsSubNav'
import Navigation from '@/components/Navigation'

export default function BrowseEventsPage () {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<EventsSubNav />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">{'Public Events'}</h1>
					<p className="text-gray-600 mb-6">{'Coming soon...'}</p>
				</div>
			</div>
		</div>
	)
}
