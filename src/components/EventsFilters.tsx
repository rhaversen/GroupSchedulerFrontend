import { HiOutlineSearch } from 'react-icons/hi'

interface EventsFiltersProps {
	searchTerm: string
	setSearchTerm: (term: string) => void
	statusFilter: string
	setStatusFilter: (filter: string) => void
	viewTab: 'upcoming' | 'past'
	setViewTab: (tab: 'upcoming' | 'past') => void
	viewMode: 'created' | 'admin' | 'participant' | 'both'
	setViewMode: (mode: 'created' | 'admin' | 'participant' | 'both') => void
	publicFilter: 'all' | 'public' | 'private'
	setPublicFilter: (filter: 'all' | 'public' | 'private') => void
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
	publicFilter,
	setPublicFilter,
	statusOptions
}: EventsFiltersProps) {
	return (
		<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
			{/* Primary Filters Row */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				{/* View Mode Filter */}
				<div className="flex justify-center lg:justify-start">
					<div className="bg-gray-50 rounded-lg p-1 inline-flex">
						{[
							{ id: 'both', label: 'All my events', icon: '👑' },
							{ id: 'created', label: 'Events I created', icon: '✨' },
							{ id: 'admin', label: 'Events I admin', icon: '⚙️' },
							{ id: 'participant', label: 'Events I participate in', icon: '🙋' }
						].map((modeOption) => (
							<button
								key={modeOption.id}
								onClick={() => setViewMode(modeOption.id as 'created' | 'admin' | 'participant' | 'both')}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									viewMode === modeOption.id
										? 'text-indigo-600 bg-white shadow-sm'
										: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
							>
								<span>{modeOption.icon}</span>
								<span>{modeOption.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Search */}
				<div className="relative w-full max-w-sm">
					<HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<input
						type="text"
						placeholder="Search events..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
					/>
				</div>
			</div>

			{/* Secondary Filters Row */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				{/* View Tabs */}
				<div className="flex justify-center sm:justify-start">
					<div className="bg-gray-50 rounded-lg p-1 inline-flex">
						{[
							{ id: 'upcoming', label: 'Upcoming', icon: '⏰' },
							{ id: 'past', label: 'Past', icon: '📜' }
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setViewTab(tab.id as 'upcoming' | 'past')}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									viewTab === tab.id
										? 'text-indigo-600 bg-white shadow-sm'
										: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
							>
								<span>{tab.icon}</span>
								<span>{tab.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Middle Section - Public/Private Filter */}
				<div className="flex justify-center">
					<div className="bg-gray-50 rounded-lg p-1 inline-flex">
						{[
							{ id: 'all', label: 'All', icon: '🌐' },
							{ id: 'public', label: 'Public', icon: '🔓' },
							{ id: 'private', label: 'Private', icon: '🔒' }
						].map((filter) => (
							<button
								key={filter.id}
								onClick={() => setPublicFilter(filter.id as 'all' | 'public' | 'private')}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									publicFilter === filter.id
										? 'text-indigo-600 bg-white shadow-sm'
										: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
							>
								<span>{filter.icon}</span>
								<span>{filter.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Status Filter */}
				<div className="flex justify-center sm:justify-end">
					<div className="bg-gray-50 rounded-lg p-1 inline-flex flex-wrap gap-1">
						{statusOptions.map((status) => (
							<button
								key={status.id}
								onClick={() => setStatusFilter(status.id)}
								className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
									statusFilter === status.id
										? 'text-indigo-600 bg-white shadow-sm'
										: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
							>
								<span>{status.icon}</span>
								<span>{status.label}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
