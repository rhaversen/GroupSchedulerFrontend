'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useUser } from '@/contexts/UserProvider'
import { fredoka } from '@/lib/fonts'

export default function NotFound () {
	const router = useRouter()
	const { currentUser } = useUser()

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			<div className="absolute left-1/2 -translate-x-1/2 top-5 z-50 w-[250px] max-w-full">
				<Image
					src="/svg/raindate-logo.svg"
					alt="RainDate Logo"
					draggable={false}
					width={250}
					height={100}
					priority
					className="w-full h-auto"
				/>
			</div>

			<Image
				src="/images/404_ocean.webp"
				alt="A rough, wide ocean."
				draggable={false}
				fill
				priority
				sizes="100vw"
				quality={100}
				className="object-cover"
			/>

			<div className="absolute w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
				<h1 className="text-center text-9xl text-blue-700">{'404'}</h1>

				<h2 className={`${fredoka.className} text-center text-3xl mb-5 text-blue-700`}>
					{'Sorry, this page got lost at sea'}
				</h2>

				<h3 className={`${fredoka.className} text-center text-xl mb-5 text-blue-900`}>
					{'The page you\'re looking for doesn\'t exist or has been moved'}
				</h3>

				<p className="text-center text-lg text-blue-800 mb-8 mx-auto">
					{currentUser
						? 'You can return to your dashboard or homepage.'
						: 'You can return to the homepage or sign in to your account.'
					}
				</p>

				<div className="flex justify-center gap-4">
					<button
						className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors"
						onClick={() => router.push('/')}
					>
						{'← Back to Homepage'}
					</button>
					{currentUser ? (
						<Link
							href="/dashboard"
							className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors inline-block"
						>
							{'Go to Dashboard →'}
						</Link>
					) : (
						<Link
							href="/login"
							className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors inline-block"
						>
							{'Sign In →'}
						</Link>
					)}
				</div>
			</div>
		</div>
	)
}
