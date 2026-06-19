interface UserAvatarProps {
	username: string
	size?: 'sm' | 'md' | 'lg'
	variant?: 'default' | 'white'
	className?: string
}

// Extract up to 3 leading grapheme clusters (first of each word) preserving emoji.
function getInitials (username: string): string {
	const words = username.split(/\s+/).filter(w => w.length > 0)

	function splitGraphemes (str: string): string[] {
		// Use modern Intl.Segmenter if available for accurate grapheme segmentation
		// Fallback to Array.from which splits by Unicode code points (good enough for most emoji)
		try {
			if (typeof Intl !== 'undefined' && Intl.Segmenter != null) {
				const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
				return Array.from(segmenter.segment(str), s => s.segment)
			}
		} catch { /* ignore */ }
		return Array.from(str)
	}

	const clusters: string[] = []
	for (const word of words) {
		if (clusters.length >= 3) { break }
		const g = splitGraphemes(word)
		if (g.length === 0) { continue }
		let first = g[0]
		// Uppercase only simple letters; leave emoji / symbols untouched
		if (/^\p{Letter}$/u.test(first)) { first = first.toUpperCase() }
		clusters.push(first)
	}
	// If no usable clusters (e.g., whitespace only), fallback to generic placeholder
	return clusters.join('') || '?'
}

export default function UserAvatar ({ username, size = 'md', variant = 'default', className = '' }: UserAvatarProps) {
	const sizeClasses = {
		sm: 'w-8 h-8',
		md: 'w-16 h-16',
		lg: 'w-20 h-20'
	}

	const variantClasses = {
		default: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
		white: 'bg-white text-indigo-600'
	}

	const initials = getInitials(username)
	// Basic scaling: longer sets of initials shrink font size
	const length = Array.from(initials).length
	const baseSize = size === 'sm' ? 16 : size === 'md' ? 30 : 38
	const computedFont = Math.max(10, Math.round(baseSize - (length - 1) * (size === 'lg' ? 7 : 5)))
	const containerPx = size === 'sm' ? 32 : size === 'md' ? 64 : 80

	return (
		<div
			className={`relative select-none overflow-hidden ${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center font-bold shadow-md whitespace-nowrap ${className}`.trim()}
			style={{ fontSize: computedFont, lineHeight: `${containerPx}px` }}
			title={username}
		>
			<span className="truncate pointer-events-none">
				{initials}
			</span>
		</div>
	)
}
