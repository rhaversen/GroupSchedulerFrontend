'use client'

import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { type ReactElement, Suspense, useCallback, useMemo, useState } from 'react'
import validator from 'validator'

const ResetPasswordInner = (): ReactElement => {
	const API_URL = process.env.NEXT_PUBLIC_API_URL
	const searchParams = useSearchParams()
	const passwordResetCodeFromQuery = searchParams.get('passwordResetCode')

	const [email, setEmail] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmNewPassword, setConfirmNewPassword] = useState('')
	const [message, setMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [shouldShake, setShouldShake] = useState(false)
	const [manualResetCode, setManualResetCode] = useState('')
	const [step, setStep] = useState<number>((passwordResetCodeFromQuery != null) ? 3 : 1)

	const effectiveResetCode = passwordResetCodeFromQuery ?? (manualResetCode || null)

	const isEmailValid = useMemo(() => validator.isEmail(email || ''), [email])
	const isPasswordValid = useMemo(() => newPassword.length >= 8, [newPassword])
	const isConfirmPasswordValid = useMemo(() => newPassword === confirmNewPassword, [newPassword, confirmNewPassword])
	const isResetCodeProvided = useMemo(() => typeof effectiveResetCode === 'string' && effectiveResetCode.length > 0, [effectiveResetCode])

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

		if (step === 4) {
			return
		}

		if (step === 3) {
			if (!isResetCodeProvided) {
				setMessage('Enter your password reset code.')
				triggerErrorShake()
				return
			}
			if (!isPasswordValid || !isConfirmPasswordValid) {
				setMessage('Ensure passwords match and are at least 4 characters long.')
				triggerErrorShake()
				return
			}

			try {
				setIsLoading(true)
				await axios.post(`${API_URL}/v1/users/reset-password`, {
					passwordResetCode: effectiveResetCode,
					newPassword,
					confirmNewPassword
				})
				setMessage('Password has been reset successfully.')
				setStep(4)
			} catch {
				setMessage('There was a problem with the server! Please try again later...')
				triggerErrorShake()
			} finally {
				setIsLoading(false)
			}
		} else if (step === 1) {
			if (!isEmailValid) {
				setMessage('Enter a valid email address')
				triggerErrorShake()
				return
			}

			try {
				setIsLoading(true)
				await axios.post(`${API_URL}/v1/users/request-password-reset-email`, { email })
				setMessage('If you have signed up with this email, a password reset link has been sent to your email inbox')
				setStep(2)
			} catch {
				setMessage('There was a problem with the server! Please try again later...')
				triggerErrorShake()
			} finally {
				setIsLoading(false)
			}
		} else if (step === 2) {
			if (!manualResetCode || manualResetCode.length === 0) {
				setMessage('Enter your password reset code.')
				triggerErrorShake()
				return
			}
			setStep(3)
		}
	}, [API_URL, email, newPassword, confirmNewPassword, isEmailValid, isPasswordValid, isConfirmPasswordValid, isResetCodeProvided, effectiveResetCode, step, manualResetCode])

	return (
		<main className="p-5 flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
			{step === 4 ? (
				<div className="w-full max-w-sm flex flex-col space-y-5 text-center">
					<h1 className="text-xl font-semibold">{'Password reset successful'}</h1>
					<p className="text-sm text-gray-700">{'Your password has been updated. You can now log in with your new password.'}</p>
					<Link
						href="/login"
						className="w-full inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						{'Go to login\r'}
					</Link>
				</div>
			) : (
			<form onSubmit={handleSubmit} className={`w-full max-w-sm flex flex-col space-y-5 ${shouldShake ? 'shake' : ''}`}>
				{step === 1 && (
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
				)}

				{step === 2 && (
					<>
						<div className="space-y-2">
							<label htmlFor="passwordResetCode" className="block text-sm font-medium text-gray-700">{'Password Reset Code'}</label>
							<input
								id="passwordResetCode"
								name="passwordResetCode"
								type="text"
								value={manualResetCode}
								onChange={(e) => setManualResetCode(e.target.value)}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								required
							/>
						</div>
					</>
				)}

				{step === 3 && (
					<>
						<div className="space-y-2">
							<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">{'New Password'}</label>
							<input
								id="newPassword"
								name="newPassword"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								required
							/>
							{!isPasswordValid && newPassword.length > 0 && (
								<p className="text-xs text-red-600">{'Password must be at least 8 characters long'}</p>
							)}
						</div>
						<div className="space-y-2">
							<label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">{'Confirm New Password'}</label>
							<input
								id="confirmNewPassword"
								name="confirmNewPassword"
								type="password"
								value={confirmNewPassword}
								onChange={(e) => setConfirmNewPassword(e.target.value)}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								required
							/>
							{!isConfirmPasswordValid && confirmNewPassword.length > 0 && (
								<p className="text-xs text-red-600">{'Passwords do not match'}</p>
							)}
						</div>
					</>
				)}

				<div>
					<button
						type="submit"
						disabled={(step === 1 && (!isEmailValid || isLoading)) || (step === 2 && (!manualResetCode || isLoading)) || (step === 3 && (!isResetCodeProvided || !isPasswordValid || !isConfirmPasswordValid || isLoading))}
						className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 ${
							((step === 1 && (!isEmailValid || isLoading)) || (step === 2 && (!manualResetCode || isLoading)) || (step === 3 && (!isResetCodeProvided || !isPasswordValid || !isConfirmPasswordValid || isLoading))) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 cursor-pointer'
						} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
					>
						{isLoading
							? 'Processing…'
							: step === 1
								? 'Request Password Reset'
								: step === 2
									? 'Continue'
									: 'Reset Password'}
					</button>
				</div>
				{message !== '' && (
					<div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded">
						<p>{message}</p>
					</div>
				)}
			</form>
			)}

			{step !== 4 && (
				<div className="mt-4 w-full max-w-sm">
					{step === 1 ? (
						<button
							type="button"
							onClick={() => setStep(2)}
							className="w-full text-sm text-indigo-600 hover:text-indigo-900 underline cursor-pointer"
						>
							{'I already have a password reset code'}
						</button>
					) : (
						<button
							type="button"
							onClick={() => setStep(1)}
							className="w-full text-sm text-indigo-600 hover:text-indigo-900 underline cursor-pointer"
						>
							{'Request a new reset email instead'}
						</button>
					)}
				</div>
			)}

			{step !== 4 && (
				<div className="mt-6 space-y-2 text-sm text-left w-full max-w-sm">
					<div>
						<span className="text-gray-700">{'Don\'t have an account? ' }</span>
						<Link href="/signup" className="text-indigo-600 hover:text-indigo-900 cursor-pointer">{'Create one'}</Link>
					</div>
					<div>
						<span className="text-gray-700">{'Remember your password? ' }</span>
						<Link href="/login" className="text-indigo-600 hover:text-indigo-900 cursor-pointer">{'Login'}</Link>
					</div>
					<div>
						<Link href="/" className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer">
							{'Back to home'}
						</Link>
					</div>
				</div>
			)}
		</main>
	)
}

export default function Page (): ReactElement {
	return (
		<Suspense fallback={<div />}>
			<ResetPasswordInner />
		</Suspense>
	)
}
