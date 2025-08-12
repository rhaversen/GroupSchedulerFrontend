import { ReactNode, useState } from 'react'
import { FaList, FaStar, FaCog, FaHandPaper, FaScroll, FaGlobe, FaUnlock, FaLock, FaClock, FaEdit } from 'react-icons/fa'
import { HiOutlineSearch, HiOutlineRefresh, HiChevronDown, HiChevronUp } from 'react-icons/hi'

interface EventsFiltersProps {
	searchTerm: string
	setSearchTerm: (term: string) => void
	statusFilter: string
	setStatusFilter: (filter: string) => void
	viewTab: 'upcoming' | 'past'
	setViewTab: (tab: 'upcoming' | 'past') => void
	viewMode: 'created' | 'admin' | 'participant' | 'both'
	setViewMode: (mode: 'created' | 'admin' | 'participant' | 'both') => void
	visibilityFilter: 'all' | 'public' | 'private' | 'draft'
	setVisibilityFilter: (filter: 'all' | 'public' | 'private' | 'draft') => void
	statusOptions: Array<{ id: string; label: string; icon: ReactNode }>
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
	visibilityFilter,
	setVisibilityFilter,
	statusOptions
}: EventsFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false)

	const resetFilters = () => {
		setSearchTerm('')
		setStatusFilter('')
		setViewTab('upcoming')
		setViewMode('both')
		setVisibilityFilter('all')
	}

	const hasActiveFilters = Boolean(searchTerm || statusFilter || viewTab !== 'upcoming' || viewMode !== 'both' || visibilityFilter !== 'all')

	return (
		<div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-3 sm:p-4 shadow-lg">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="relative max-w-md sm:flex-1">
					<HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
					<input
						type="text"
						placeholder="Search events..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-3 py-2 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-white/50 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 text-sm"
					/>
				</div>
				<div className="flex items-center gap-2 justify-end sm:flex-shrink-0">
					{hasActiveFilters && (
						<button
							onClick={resetFilters}
							className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm transition-all duration-200 text-sm font-medium"
						>
							<HiOutlineRefresh className="h-4 w-4" />
							<span>{'Reset'}</span>
						</button>
					)}
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm transition-all duration-200 text-sm font-medium"
					>
						{isExpanded ? <HiChevronUp className="h-4 w-4" /> : <HiChevronDown className="h-4 w-4" />}
						<span>{isExpanded ? 'Hide Filters' : 'More Filters'}</span>
					</button>
				</div>
			</div>

			{(isExpanded || typeof window !== 'undefined') && (
				<div className={`mt-3 space-y-3 lg:block ${isExpanded ? 'block animate-in slide-in-from-top-2 duration-200' : 'hidden'} lg:animate-none`}>
					<div className="grid grid-cols-1 lg:grid-cols-[70%_auto] gap-3">
						<div className="space-y-1.5">
							<h3 className="text-white/90 text-xs font-medium px-1">{'Event Type'}</h3>
							<div className="flex flex-wrap gap-2">
								{[
									{ id: 'both', label: 'All Events', shortLabel: 'All', icon: <FaList /> },
									{ id: 'created', label: 'Created by Me', shortLabel: 'Created', icon: <FaStar /> },
									{ id: 'admin', label: 'Admin Role', shortLabel: 'Admin', icon: <FaCog /> },
									{ id: 'participant', label: 'Participating', shortLabel: 'Participant', icon: <FaHandPaper /> }
								].map((modeOption) => (
									<button
										key={modeOption.id}
										onClick={() => setViewMode(modeOption.id as 'created' | 'admin' | 'participant' | 'both')}
										className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-w-0 ${
											viewMode === modeOption.id
												? 'bg-white text-indigo-600 shadow-md transform scale-105'
												: 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
										}`}
									>
										<span className="text-sm">{modeOption.icon}</span>
										<span className="hidden sm:inline">{modeOption.label}</span>
										<span className="sm:hidden">{modeOption.shortLabel}</span>
									</button>
								))}
							</div>
						</div>

						<div className="space-y-1.5">
							<h3 className="text-white/90 text-xs font-medium px-1">{'Time Period'}</h3>
							<div className="flex flex-wrap gap-2">
								{[
									{ id: 'upcoming', label: 'Upcoming', icon: <FaClock /> },
									{ id: 'past', label: 'Past', icon: <FaScroll /> }
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() => setViewTab(tab.id as 'upcoming' | 'past')}
										className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-w-0 ${
											viewTab === tab.id
												? 'bg-white text-indigo-600 shadow-md transform scale-105'
												: 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
										}`}
									>
										<span className="text-sm">{tab.icon}</span>
										<span>{tab.label}</span>
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-[70%_auto] gap-3">
						{statusOptions.length > 0 && (
							<div className="space-y-1.5">
								<h3 className="text-white/90 text-xs font-medium px-1">{'Status'}</h3>
								<div className="flex flex-wrap gap-2">
									{statusOptions.map((status) => (
										<button
											key={status.id}
											onClick={() => setStatusFilter(status.id)}
											className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-w-0 ${
												statusFilter === status.id
													? 'bg-white text-indigo-600 shadow-md transform scale-105'
													: 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
											}`}
										>
											<span className="text-sm">{status.icon}</span>
											<span>{status.label}</span>
										</button>
									))}
								</div>
							</div>
						)}

						<div className="space-y-1.5">
							<h3 className="text-white/90 text-xs font-medium px-1">{'Visibility'}</h3>
							<div className="flex flex-wrap gap-2">
								{[
									{ id: 'all', label: 'All', icon: <FaGlobe /> },
									{ id: 'public', label: 'Public', icon: <FaUnlock /> },
									{ id: 'private', label: 'Private', icon: <FaLock /> },
									{ id: 'draft', label: 'Draft', icon: <FaEdit /> }
								].map((filter) => (
									<button
										key={filter.id}
										onClick={() => setVisibilityFilter(filter.id as 'all' | 'public' | 'private' | 'draft')}
										className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-w-0 ${
											visibilityFilter === filter.id
												? 'bg-white text-indigo-600 shadow-md transform scale-105'
												: 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
										}`}
									>
										<span className="text-sm">{filter.icon}</span>
										<span>{filter.label}</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
