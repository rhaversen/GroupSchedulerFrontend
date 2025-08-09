'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { useUser } from '@/contexts/UserProvider'
import { caveat, fredoka } from '@/lib/fonts'

const Dashboard: React.FC = () => {
	const { currentUser } = useUser()

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			<div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-[250px] h-auto">
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
				src="/images/landing_lake.webp"
				alt="A calm lake with rain and a golden stone creating ripples, against hills and a cloudy sky."
				draggable="false"
				className="object-cover w-full h-full"
				width='1920'
				height='1080'
				quality={100}
			/>
			<h1 className={`${caveat.className} font-bold absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 max-w-full text-5xl text-center text-blue-800 whitespace-nowrap`}>
				{'Find the Time '}<br /> {'to Do Some Things\r'}
			</h1>
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
				<div>
					{currentUser ? (
						<Link href="/dashboard">
							<button className={`${fredoka.className} text-lg bg-blue-800 text-white py-2.5 px-12 m-2.5 rounded-lg cursor-pointer transition duration-300`}>
								{'Go to Dashboard\r'}
							</button>
						</Link>
					) : (
						<div className="flex flex-col justify-center items-center">
							<div>
								<Link href="/signup">
									<button className={`${fredoka.className} text-lg bg-blue-800 text-white py-2.5 px-12 m-2.5 rounded-lg cursor-pointer transition duration-300`}>
										{'Sign up\r'}
									</button>
								</Link>
								<Link href="/login">
									<button className={`${fredoka.className} text-lg bg-blue-800 text-white py-2.5 px-12 m-2.5 rounded-lg cursor-pointer transition duration-300`}>
										{'Log in\r'}
									</button>
								</Link>
							</div>
							<div className="mt-4 flex justify-center">
								<Link href="/reset-password">
									<button className={`${fredoka.className} text-sm bg-blue-800 text-white py-1.5 px-8 rounded-lg cursor-pointer transition duration-300`}>
										{'Reset Password'}
									</button>
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default Dashboard
