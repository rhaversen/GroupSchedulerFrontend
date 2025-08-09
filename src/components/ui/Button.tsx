import { type HTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
	size?: 'sm' | 'md' | 'lg'
	disabled?: boolean
	type?: 'button' | 'submit' | 'reset'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = '', variant = 'primary', size = 'md', disabled = false, type = 'button', ...props }, ref) => {
		const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

		const variantClasses = {
			primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
			secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
			outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
			ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
		}

		const sizeClasses = {
			sm: 'px-3 py-2 text-sm',
			md: 'px-4 py-2 text-sm',
			lg: 'px-6 py-3 text-base'
		}

		return (
			<button
				ref={ref}
				type={type}
				disabled={disabled}
				className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
				{...props}
			/>
		)
	}
)

Button.displayName = 'Button'

export { Button }
