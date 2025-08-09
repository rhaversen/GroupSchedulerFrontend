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
		<div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
			<div className="p-5">
				<div className="flex items-center">
					<div className="flex-shrink-0">
						{icon}
					</div>
					<div className="ml-5 w-0 flex-1">
						<dl>
							<dt className="text-sm font-medium text-gray-500 truncate">
								{title}
							</dt>
							<dd className="text-lg font-medium text-gray-900">
								{value}
							</dd>
							{description && (
								<dd className="text-sm text-gray-500">
									{description}
								</dd>
							)}
						</dl>
					</div>
				</div>
			</div>
		</div>
	)
}

export { StatsCard }
