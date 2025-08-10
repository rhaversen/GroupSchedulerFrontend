interface UserAvatarProps {
	username: string
	size?: 'sm' | 'md' | 'lg'
	variant?: 'default' | 'white'
	className?: string
}

function getInitials (username: string): string {
	const words = username.split(/\s+/).filter(word => word.length > 0)
	const initials = words.map(word => word.charAt(0).toUpperCase()).slice(0, 3)
	return initials.join('')
}

export default function UserAvatar ({ username, size = 'md', variant = 'default', className = '' }: UserAvatarProps) {
	const sizeClasses = {
		sm: 'w-8 h-8 text-sm',
		md: 'w-16 h-16 text-2xl',
		lg: 'w-20 h-20 text-3xl'
	}

	const variantClasses = {
		default: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
		white: 'bg-white text-indigo-600'
	}

	return (
		<div
			className={`
				${sizeClasses[size]}
				${variantClasses[variant]}
				rounded-full flex items-center justify-center font-bold shadow-md
				${className}
			`.trim()}
		>
			{getInitials(username)}
		</div>
	)
}
