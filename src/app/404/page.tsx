'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { fredoka } from '@/lib/fonts'

function Custom404 () {
	const router = useRouter()
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
				<h1 className="text-center text-9xl text-blue-700">{'404\r'}</h1>

				<h2 className={`${fredoka.className} text-center text-3xl mb-5 text-blue-700`}>{'Sorry, this page got lost at sea\r'}</h2>

				<h3 className={`${fredoka.className} text-center text-xl mb-5 text-blue-900`}>{'This app is still under development, please come back later\r'}</h3>
				<button
					className="block mx-auto px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors"
					onClick={() => router.push('/')}
				>
					{'Go Home'}
				</button>
			</div>
		</div>
	)
}

export default Custom404
