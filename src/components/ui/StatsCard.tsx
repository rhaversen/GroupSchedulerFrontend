import { type ReactElement, type ReactNode } from 'react'

interface StatsCardProps {
	title: string
	value: number | string
	description?: string
	icon?: ReactNode
	className?: string
}

const StatsCard = ({ title, value, description, icon, className = '' }: StatsCardProps): ReactElement => {
	return (
		<div className={`group relative bg-white overflow-hidden rounded-2xl shadow hover:shadow-lg transition-shadow ${className}`}>
			<div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-opacity" />
				<div className="p-5 flex items-start gap-4">
					<div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shadow-sm">
					{icon}
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
						{title}
					</div>
					<div className="text-3xl font-bold text-gray-900 leading-tight mb-1">
						{value}
					</div>
					{(description !== undefined && description !== null && description !== '') && (
						<p className="text-sm text-gray-500 leading-snug">
							{description}
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

export { StatsCard }
