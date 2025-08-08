'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { type ReactElement, useCallback, useEffect, useState } from 'react'

import { useError } from '@/contexts/ErrorProvider'
import { useUser } from '@/contexts/UserProvider'
import { type UserType } from '@/types/backendDataTypes'

export default function Page (): ReactElement {
	const API_URL = process.env.NEXT_PUBLIC_API_URL
	const router = useRouter()
	const { addError } = useError()
	const { setCurrentUser } = useUser()
	const [isLoading, setIsLoading] = useState(false) // Add isLoading state
	const [shouldShake, setShouldShake] = useState(false) // Add shake state

	const triggerErrorShake = (): void => {
		setShouldShake(true)
		setTimeout(() => setShouldShake(false), 500)
	}

	const login = useCallback(async (credentials: {
		email: FormDataEntryValue | null
		password: FormDataEntryValue | null
		stayLoggedIn: boolean
	}) => {
		try {
			setIsLoading(true) // Set loading true
			const response = await axios.post<{
				auth: boolean
				user: UserType
			}>(`${API_URL}/v1/auth/login-user-local`, credentials, { withCredentials: true })
			setCurrentUser(response.data.user)
			router.push('/dashboard')
		} catch (error) {
			setCurrentUser(null)
			setIsLoading(false) // Set loading false only on error
			// Check if it's an Axios error and has a response
			if (axios.isAxiosError(error) && error.response) {
				// Check if the status code is 401
				if (error.response.status === 401) {
					triggerErrorShake() // Trigger shake effect on 401
					// Extract message from response data, default to a generic message if not found
					const message = error.response.data?.error ?? 'Wrong username or password'
					addError(new Error(message)) // Pass the specific message
				} else {
					// Handle other Axios errors
					addError(error)
				}
			} else {
				// Handle non-Axios errors or errors without a response
				addError(error)
			}
		}
	}, [API_URL, addError, router, setCurrentUser])

	useEffect(() => {
		axios.get(`${API_URL}/v1/auth/is-authenticated`, { withCredentials: true }).then(() => {
			router.push('/dashboard')
			return null
		}).catch(() => {
			// Do nothing
		})
	}, [API_URL, router])

	const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault() // Prevent default form submission
		const formData = new FormData(event.currentTarget)
		const credentials = {
			email: formData.get('username'),
			password: formData.get('password'),
			stayLoggedIn: formData.get('stayLoggedIn') === 'on' // Convert on to boolean
		}
		login(credentials).catch(addError)
	}, [addError, login])

	return (
		<main className="p-5 flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
			<form onSubmit={handleSubmit} className={`w-full max-w-sm flex flex-col justify-between space-y-5 ${shouldShake ? 'shake' : ''}`}>
				<div className="space-y-2">
					<label htmlFor="username" className="block text-sm font-medium text-gray-700">
						{'Email'}
					</label>
					<input type="username" id="username" name="username"
						className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						required />
				</div>
				<div className="space-y-2">
					<label htmlFor="password" className="block text-sm font-medium text-gray-700">
						{'Password'}
					</label>
					<input type="password" id="password" name="password"
						className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						required />
				</div>
				<div className="space-y-2">
					<label htmlFor="stayLoggedIn" className="flex items-center">
						<input type="checkbox" id="stayLoggedIn" name="stayLoggedIn"
							className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
						<span className="ml-2 block text-sm text-gray-900">
							{'Stay logged in'}
						</span>
					</label>
				</div>
				<div>
					<button type="submit"
						disabled={isLoading} // Disable button when loading
						className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
							isLoading ? 'opacity-50 cursor-not-allowed' : ''
						}`}>
						{isLoading ? 'Logging in...' : 'Log in'}
					</button>
				</div>
			</form>
			<div className="mt-5">
				<button type="button" onClick={() => { router.push('/') }}
					className="text-sm text-indigo-600 hover:text-indigo-900">
					{'Back to home'}
				</button>
			</div>
		</main>
	)
}
