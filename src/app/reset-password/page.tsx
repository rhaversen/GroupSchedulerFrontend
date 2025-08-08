'use client'

import axios from 'axios'
import Link from 'next/link'
import React, { type ReactElement, useCallback, useMemo, useState } from 'react'
import validator from 'validator'

export default function Page (): ReactElement {
	const API_URL = process.env.NEXT_PUBLIC_API_URL
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [shouldShake, setShouldShake] = useState(false)

	const isEmailValid = useMemo(() => validator.isEmail(email || ''), [email])

	const triggerErrorShake = (): void => {
		setShouldShake(true)
		setTimeout(() => setShouldShake(false), 500)
	}

	const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setMessage('')

		if (typeof API_URL !== 'string' || API_URL.length === 0) {
			setMessage('Server is not configured. Please try again later.')
			triggerErrorShake()
			return
		}

		if (!isEmailValid) {
			setMessage('Enter a valid email address')
			triggerErrorShake()
			return
		}

		try {
			setIsLoading(true)
			await axios.post(`${API_URL}/v1/users/request-password-reset-email`, { email })
			setMessage('If you have signed up with this email, a password reset link has been sent to your email inbox')
		} catch {
			setMessage('There was a problem with the server! Please try again later...')
			triggerErrorShake()
		} finally {
			setIsLoading(false)
		}
	}, [API_URL, email, isEmailValid])

	return (
		<main className="p-5 flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
			<form onSubmit={handleSubmit} className={`w-full max-w-sm flex flex-col space-y-5 ${shouldShake ? 'shake' : ''}`}>
				<div className="space-y-2">
					<label htmlFor="email" className="block text-sm font-medium text-gray-700">{'Email'}</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						required
					/>
					{!isEmailValid && email.length > 0 && (
						<p className="text-xs text-red-600">{'Enter a valid email address'}</p>
					)}
				</div>
				<div>
					<button
						type="submit"
						disabled={!isEmailValid || isLoading}
						className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 ${
							(!isEmailValid || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
						} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
					>
						{isLoading ? 'Requesting…' : 'Request Password Reset'}
					</button>
				</div>
				{message !== '' && (
					<div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded">
						<p>{message}</p>
					</div>
				)}
			</form>
			<div className="mt-6 space-y-2 text-sm text-left w-full max-w-sm">
				<div>
					<span className="text-gray-700">{'Don\'t have an account? ' }</span>
					<Link href="/signup" className="text-indigo-600 hover:text-indigo-900">{'Create one'}</Link>
				</div>
				<div>
					<span className="text-gray-700">{'Remember your password? ' }</span>
					<Link href="/login" className="text-indigo-600 hover:text-indigo-900">{'Login'}</Link>
				</div>
				<div>
					<Link href="/" className="text-sm text-indigo-600 hover:text-indigo-900">
						{'Back to home'}
					</Link>
				</div>
			</div>
		</main>
	)
}
