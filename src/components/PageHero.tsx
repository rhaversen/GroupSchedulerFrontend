'use client'

import { type ReactNode } from 'react'

interface PageHeroProps {
	title: ReactNode
	subtitle?: ReactNode
	actions?: ReactNode
	children?: ReactNode
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

// Gradient hero section for page titles.
export default function PageHero ({ title, subtitle, actions, children, size = 'md', className = '' }: PageHeroProps) {
	const padding = size === 'lg' ? 'p-10' : size === 'sm' ? 'p-6' : 'p-8 lg:p-10'
	return (
		<div className={`bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl text-white shadow-xl ${padding} ${className}`}>
			<div className="max-w-4xl">
				<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{title}</h1>
				{subtitle != null ? <p className="text-indigo-100 text-lg sm:text-xl">{subtitle}</p> : null}
				{actions != null ? <div className="flex flex-wrap gap-4 mt-4 mb-2">{actions}</div> : null}
			</div>
			<div className={children != null ? 'mt-6' : undefined}>
				{children}
			</div>
		</div>
	)
}
