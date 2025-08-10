import { HiOutlineSearch } from 'react-icons/hi'

interface EventsFiltersProps {
	searchTerm: string
	setSearchTerm: (term: string) => void
	statusFilter: string
	setStatusFilter: (filter: string) => void
	viewTab: 'all' | 'upcoming' | 'past'
	setViewTab: (tab: 'all' | 'upcoming' | 'past') => void
	viewMode: 'created' | 'admin' | 'both'
	setViewMode: (mode: 'created' | 'admin' | 'both') => void
	statusOptions: Array<{ id: string; label: string; icon: string }>
}

export default function EventsFilters ({
	searchTerm,
	setSearchTerm,
	statusFilter,
	setStatusFilter,
	viewTab,
	setViewTab,
	viewMode,
	setViewMode,
	statusOptions
}: EventsFiltersProps) {
	return (
		<div className="space-y-6">
			{/* View Mode Filter */}
			<div className="flex justify-center">
				<div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
					{[
						{ id: 'both', label: 'All my events', icon: '👑' },
						{ id: 'created', label: 'Events I created', icon: '✨' },
						{ id: 'admin', label: 'Events I admin', icon: '⚙️' }
					].map((modeOption) => (
						<button
							key={modeOption.id}
							onClick={() => setViewMode(modeOption.id as 'created' | 'admin' | 'both')}
							className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
								viewMode === modeOption.id
									? 'text-indigo-600 bg-indigo-50'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
							}`}
						>
							<span>{modeOption.icon}</span>
							<span>{modeOption.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Search */}
			<div className="flex justify-center">
				<div className="relative w-full max-w-md">
					<HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<input
						type="text"
						placeholder="Search events..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>
			</div>

			{/* View Tabs */}
			<div className="flex justify-center">
				<div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
					{[
						{ id: 'all', label: 'All Events', icon: '📅' },
						{ id: 'upcoming', label: 'Upcoming', icon: '⏰' },
						{ id: 'past', label: 'Past', icon: '📜' }
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setViewTab(tab.id as 'all' | 'upcoming' | 'past')}
							className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
								viewTab === tab.id
									? 'text-indigo-600 bg-indigo-50'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
							}`}
						>
							<span>{tab.icon}</span>
							<span>{tab.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Status Filter */}
			<div className="flex justify-center">
				<div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex flex-wrap">
					{statusOptions.map((status) => (
						<button
							key={status.id}
							onClick={() => setStatusFilter(status.id)}
							className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								statusFilter === status.id
									? 'text-indigo-600 bg-indigo-50'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
							}`}
						>
							<span>{status.icon}</span>
							<span>{status.label}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
