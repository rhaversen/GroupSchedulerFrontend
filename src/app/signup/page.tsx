'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { type ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import validator from 'validator'

import { useError } from '@/contexts/ErrorProvider'
import { useUser } from '@/contexts/UserProvider'
import { type UserType } from '@/types/backendDataTypes'

type Step = 1 | 2

interface UsernameStepProps {
	username: string
	onUsernameChange: (value: string) => void
	onBack: () => void
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
	isLoading: boolean
}

function UsernameStep ({ username, onUsernameChange, onBack, onSubmit, isLoading }: UsernameStepProps): ReactElement {
	return (
		<form className="w-full max-w-sm flex flex-col justify-between space-y-5" onSubmit={onSubmit}>
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-gray-900">{'Hello there!'}</h1>
				<p className="text-sm text-gray-600">{'Please type your name to finish setting up your account.'}</p>
			</div>
			<div className="space-y-2">
				<label htmlFor="username" className="block text-sm font-medium text-gray-700">
					{'Name'}
				</label>
				<input
					type="text"
					id="username"
					name="username"
					value={username}
					onChange={(e) => onUsernameChange(e.target.value)}
					placeholder="Your name"
					className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					required
				/>
			</div>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={onBack}
					className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
				>
					{'Back'}
				</button>
				<button
					type="submit"
					disabled={isLoading || username.trim().length === 0}
					className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 ${
						isLoading || username.trim().length === 0
							? 'opacity-50 cursor-not-allowed'
							: 'hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					}`}
				>
					{isLoading ? 'Creating account...' : 'Create account'}
				</button>
			</div>
			<div className="mt-2">
				<button
					type="button"
					onClick={() => {
						// Navigate back to home if desired
						window.location.assign('/')
					}}
					className="text-sm text-indigo-600 hover:text-indigo-900"
				>
					{'Back to home'}
				</button>
			</div>
		</form>
	)
}

export default function Page (): ReactElement {
	const API_URL = process.env.NEXT_PUBLIC_API_URL
	const router = useRouter()
	const { addError } = useError()
	const { setCurrentUser } = useUser()

	const [step, setStep] = useState<Step>(1)
	const [isLoading, setIsLoading] = useState(false)

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [username, setUsername] = useState('')

	const [loginError, setLoginError] = useState<string | null>(null)

	const emailValid = useMemo(() => {
		return validator.isEmail(email.trim()) && email.trim().length >= 5
	}, [email])

	const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword])
	const passwordValid = useMemo(() => password.length >= 4, [password])
	const canContinue = useMemo(() => emailValid && password.length > 0 && passwordsMatch, [emailValid, password, passwordsMatch])

	const goNext = useCallback(() => {
		if (canContinue) {
			setStep(2)
		}
	}, [canContinue])

	const goBack = useCallback(() => setStep(1), [])

	const register = useCallback(async () => {
		try {
			setIsLoading(true)
			const payload = { email: email.trim(), password, confirmPassword, username: username.trim() }
			const response = await axios.post<{
				auth: boolean
				user: UserType
			}>(`${API_URL}/v1/users/register`, payload, { withCredentials: true })
			setCurrentUser(response.data.user)
			router.push('/dashboard')
		} catch (error) {
			setCurrentUser(null)
			setIsLoading(false)
			if (axios.isAxiosError(error) && error.response) {
				if (error.response.status === 401) {
					goBack()
					setLoginError('A user already registered with this email, and the password is incorrect')
				} else {
					const message = error.response.data?.error ?? 'Sign up failed'
					addError(new Error(message))
				}
			} else {
				addError(error)
			}
		}
	}, [API_URL, addError, confirmPassword, email, goBack, password, router, setCurrentUser, username])

	useEffect(() => {
		axios
			.get(`${API_URL}/v1/auth/is-authenticated`, { withCredentials: true })
			.then(() => {
				router.push('/dashboard')
				return null
			})
			.catch(() => {
				// Not authenticated; stay on page
			})
	}, [API_URL, router])

	const onSubmitStep1 = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault()
			if (!emailValid) {
				addError(new Error('Please enter a valid email'))
				return
			}
			if (!passwordsMatch) {
				addError(new Error('Passwords do not match'))
				return
			}
			if (password.length === 0) {
				addError(new Error('Password is required'))
				return
			}
			if (!passwordValid) {
				addError(new Error('Password must be at least 4 characters long'))
				return
			}
			goNext()
		},
		[addError, emailValid, goNext, password.length, passwordValid, passwordsMatch]
	)

	const onSubmitStep2 = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault()
			if (username.trim().length === 0) {
				addError(new Error('Username is required'))
				return
			}
			register().catch(addError)
		},
		[addError, register, username]
	)

	return (
		<main className="relative w-screen h-screen overflow-hidden bg-gray-100 text-black">
			<div
				className="w-[200vw] flex transition-transform duration-500 ease-in-out"
				style={{ transform: `translateX(-${(step - 1) * 100}vw)` }}
			>
				<div className="w-screen h-screen flex items-center justify-center">
					<div className="w-full max-w-sm px-2">
						<form className="w-full flex flex-col justify-between space-y-5" onSubmit={onSubmitStep1}>
							<div className="space-y-2">
								<label htmlFor="email" className="block text-sm font-medium text-gray-700">
									{'Email'}
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									required
								/>
								{!emailValid && email.length > 0 && (
									<p className="text-xs text-red-600">{'Enter a valid email address'}</p>
								)}
							</div>
							<div className="space-y-2">
								<label htmlFor="password" className="block text-sm font-medium text-gray-700">
									{'Password'}
								</label>
								<input
									type="password"
									id="password"
									name="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									required
								/>
								{password.length > 0 && !passwordValid && (
									<p className="text-xs text-red-600">{'Password must be at least 4 characters long'}</p>
								)}
							</div>
							<div className="space-y-2">
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
									{'Confirm Password'}
								</label>
								<input
									type="password"
									id="confirmPassword"
									name="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									required
								/>
								{!passwordsMatch && confirmPassword.length > 0 && (
									<p className="text-xs text-red-600">{'Passwords must match'}</p>
								)}
							</div>
							<div>
								<button
									type="submit"
									disabled={!canContinue}
									className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 ${
										canContinue ? 'hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' : 'opacity-50 cursor-not-allowed'
									}`}
								>
									{'Continue'}
								</button>
							</div>
							<div className="mt-2">
								<button
									type="button"
									onClick={() => {
										router.push('/login')
									}}
									className="text-sm text-indigo-600 hover:text-indigo-900"
								>
									{'Already have an account? Log in'}
								</button>
							</div>
						</form>
					</div>
				</div>
				<div className="w-screen h-screen flex items-center justify-center">
					<div className="w-full max-w-sm px-2">
						<UsernameStep
							username={username}
							onUsernameChange={setUsername}
							onBack={goBack}
							onSubmit={onSubmitStep2}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</div>
			{(loginError != null) && (
				<div className="absolute bottom-4 left-0 right-0 flex justify-center px-2">
					<div className="bg-red-100 border border-red-500 text-red-700 px-4 py-2 rounded">
						{loginError}
					</div>
				</div>
			)}
		</main>
	)
}
