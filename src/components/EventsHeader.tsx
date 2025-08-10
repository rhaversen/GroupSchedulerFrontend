interface EventsHeaderProps {
	title: string
	description: string
}

export default function EventsHeader ({ title, description }: EventsHeaderProps) {
	return (
		<div className="text-center">
			<h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
			<p className="text-gray-600 mb-6">{description}</p>
		</div>
	)
}
