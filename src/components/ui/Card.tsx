import { type HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: 'default' | 'elevated' | 'outlined'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
	({ className = '', variant = 'default', ...props }, ref) => {
		const baseClasses = 'rounded-lg bg-white'
		const variantClasses = {
			default: 'border shadow-sm',
			elevated: 'border shadow-lg',
			outlined: 'border-2 border-gray-200'
		}

		return (
			<div
				ref={ref}
				className={`${baseClasses} ${variantClasses[variant]} ${className}`}
				{...props}
			/>
		)
	}
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className = '', ...props }, ref) => (
		<div ref={ref} className={`flex flex-col space-y-1.5 p-6 pb-3 ${className}`} {...props} />
	)
)

CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
	({ className = '', ...props }, ref) => (
		<h3 ref={ref} className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
	)
)

CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className = '', ...props }, ref) => (
		<div ref={ref} className={`p-6 ${className}`} {...props} />
	)
)

CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
