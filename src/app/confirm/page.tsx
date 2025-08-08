'use client'

import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type ReactElement, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import validator from 'validator'
import { useUser } from '@/contexts/UserProvider'
import { type UserType } from '@/types/backendDataTypes'

const ConfirmEmailInner = (): ReactElement => {
	const API_URL = process.env.NEXT_PUBLIC_API_URL
	const searchParams = useSearchParams()
	const [message, setMessage] = useState('')
	const [isSuccess, setIsSuccess] = useState(false)
	const [isError, setIsError] = useState(false)
	const [codeInput, setCodeInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const { currentUser, setCurrentUser } = useUser()

	const [resendEmail, setResendEmail] = useState('')
	const [resendMessage, setResendMessage] = useState('')
	const [resendIsError, setResendIsError] = useState(false)
	const [isResendLoading, setIsResendLoading] = useState(false)
	const [showResendForm, setShowResendForm] = useState(false)

	const codeFromQuery = searchParams?.get('confirmationCode') ?? ''
	const hasCodeInQuery = useMemo(() => codeFromQuery.length > 0, [codeFromQuery])
	const effectiveResendEmail = useMemo(() => currentUser?.email ?? resendEmail, [currentUser?.email, resendEmail])
	const isResendEmailValid = useMemo(
		() => validator.isEmail((effectiveResendEmail ?? '') as string),
		[effectiveResendEmail]
	)
	const isAlreadyConfirmed = currentUser?.confirmed === true

	const confirmWithCode = useCallback(async (code: string): Promise<void> => {
		if (typeof API_URL !== 'string' || API_URL.length === 0) {
			setMessage('Server is not configured. Please try again later.')
			setIsSuccess(false)
			setIsError(true)
			return
		}

		if (code.trim().length === 0) {
			setMessage('Please enter a confirmation code.')
			setIsSuccess(false)
			setIsError(true)
			return
		}

		setIsLoading(true)
		setIsError(false)
		setMessage('Confirming your email...')
		try {
			const encoded = encodeURIComponent(code.trim())
			const res = await axios.post(`${API_URL}/v1/users/confirm?confirmationCode=${encoded}`)
			const data: unknown = res?.data
			let newMessage: string | undefined
			let updatedUser: UserType | undefined
			if (data && typeof data === 'object') {
				const maybeObj = data as Record<string, unknown>
				if (typeof maybeObj.message === 'string') newMessage = maybeObj.message
				if (maybeObj.user && typeof maybeObj.user === 'object') updatedUser = maybeObj.user as UserType
				else if (typeof (maybeObj as any)._id === 'string') updatedUser = maybeObj as unknown as UserType
			}
			if (updatedUser) setCurrentUser(updatedUser)
			setMessage(newMessage ?? 'Confirmation successful! Your account has been activated.')
			setIsSuccess(true)
			setIsError(false)
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setMessage(error.response?.data?.error ?? 'Confirmation unsuccessful. Please try again.')
			} else {
				setMessage('Confirmation unsuccessful. Please try again.')
			}
			setIsSuccess(false)
			setIsError(true)
		} finally {
			setIsLoading(false)
		}
	}, [API_URL, setCurrentUser])

	const requestNewConfirmation = useCallback(async (): Promise<void> => {
		setResendMessage('')
		setResendIsError(false)

		if (typeof API_URL !== 'string' || API_URL.length === 0) {
			setResendMessage('Server is not configured. Please try again later.')
			setResendIsError(true)
			return
		}
		if (!isResendEmailValid) {
			setResendMessage('Enter a valid email address')
			setResendIsError(true)
			return
		}

		try {
			setIsResendLoading(true)
			await axios.post(`${API_URL}/v1/users/request-confirmation`, { email: effectiveResendEmail })
			setResendMessage('If your account is unconfirmed, a new confirmation email has been sent.')
			setResendIsError(false)
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setResendMessage(error.response?.data?.error ?? 'Unable to send confirmation email. Please try again later.')
			} else {
				setResendMessage('Unable to send confirmation email. Please try again later.')
			}
			setResendIsError(true)
		} finally {
			setIsResendLoading(false)
		}
	}, [API_URL, effectiveResendEmail, isResendEmailValid])

	useEffect(() => {
		if (!hasCodeInQuery) {
			setMessage('')
			setIsSuccess(false)
			return
		}

		confirmWithCode(codeFromQuery).catch(() => {
			setMessage('Confirmation unsuccessful. Please try again.')
			setIsSuccess(false)
		})
	}, [hasCodeInQuery, codeFromQuery, confirmWithCode])

	return (
		<div className="w-full max-w-md space-y-4">
			{isAlreadyConfirmed && !isSuccess && (
				<div className="px-4 py-2 rounded border bg-green-50 border-green-200 text-green-800">
					<p>{'Your email is already confirmed.'}</p>
				</div>
			)}
			{message !== '' && (!isAlreadyConfirmed || isSuccess) && (
				<div className={`px-4 py-2 rounded border ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
					<p>{message}</p>
				</div>
			)}

			{!isSuccess && !showResendForm && !hasCodeInQuery && !isAlreadyConfirmed && (
				<form
					className="space-y-3 bg-white p-4 rounded shadow"
					onSubmit={(e) => {
						e.preventDefault()
						void confirmWithCode(codeInput)
					}}
				>
					<label className="block text-sm font-medium text-gray-700" htmlFor="confirmationCode">{'Confirmation code'}</label>
					<input
						id="confirmationCode"
						type="text"
						value={codeInput}
						onChange={(e) => setCodeInput(e.target.value)}
						placeholder="Paste your confirmation code"
						className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						autoComplete="one-time-code"
					/>
					<button
						type="submit"
						disabled={isLoading || codeInput.trim().length === 0}
						className="w-full rounded bg-indigo-600 text-white py-2 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
					>
						{isLoading ? 'Confirming…' : 'Confirm Email'}
					</button>
				</form>
			)}

			{!isSuccess && showResendForm && !isAlreadyConfirmed && (
				<div className="space-y-3 bg-white p-4 rounded shadow">
					<h2 className="text-sm font-medium text-gray-800">{'Resend confirmation email'}</h2>
					<form onSubmit={(e) => {
						e.preventDefault()
						void requestNewConfirmation()
					}} className="space-y-2">
						{currentUser ? (
							<p className="text-sm text-gray-700">{`Email: ${currentUser.email ?? ''}`}</p>
						) : (
							<>
								<label className="block text-sm font-medium text-gray-700" htmlFor="resendEmail">{'Email'}</label>
								<input
									id="resendEmail"
									type="email"
									value={resendEmail}
									onChange={(e) => setResendEmail(e.target.value)}
									placeholder="Enter your email"
									className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
									autoComplete="email"
								/>
								{resendEmail.length > 0 && !isResendEmailValid && (
									<p className="text-xs text-red-600">{'Enter a valid email address'}</p>
								)}
							</>
						)}
						<button
							type="submit"
							disabled={isResendLoading || !isResendEmailValid || isAlreadyConfirmed}
							className="w-full rounded bg-indigo-600 text-white py-2 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
						>
							{isResendLoading ? 'Sending…' : 'Send confirmation email'}
						</button>
					</form>
					{resendMessage !== '' && (
						<div className={`px-3 py-2 rounded border ${resendIsError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
							<p>{resendMessage}</p>
						</div>
					)}
				</div>
			)}

			{!isSuccess && !isAlreadyConfirmed && (
				<div>
					<button
						type="button"
						onClick={() => setShowResendForm(prev => !prev)}
						className="text-sm text-indigo-600 hover:text-indigo-900 underline cursor-pointer"
						disabled={isAlreadyConfirmed}
					>
						{showResendForm ? 'I have a confirmation code' : 'Resend confirmation email'}
					</button>
				</div>
			)}

			<div className="text-sm">
				{isSuccess || isAlreadyConfirmed ? (
					<div>
						<Link
							href="/dashboard"
							className="inline-block w-full text-center rounded bg-indigo-600 text-white py-2 hover:bg-indigo-700"
						>
							{'Proceed to Dashboard'}
						</Link>
					</div>
				) : (
					<div>
						<span className="text-gray-700">{'Having trouble? '}</span>
						<Link href="/support" className="text-indigo-600 hover:text-indigo-900">{'Contact support'}</Link>
					</div>
				)}
			</div>
		</div>
	)
}

const ConfirmEmail = (): ReactElement => (
	<main className="p-5 flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
		<Suspense fallback={<div />}>
			<ConfirmEmailInner />
		</Suspense>
	</main>
)

export default ConfirmEmail
