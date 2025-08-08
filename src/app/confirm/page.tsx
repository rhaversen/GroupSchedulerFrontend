'use client'

import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type ReactElement, Suspense, useCallback, useEffect, useMemo, useState } from 'react'

const ConfirmEmailInner = (): ReactElement => {
	const API_URL = process.env.NEXT_PUBLIC_API_URL
	const searchParams = useSearchParams()
	const [message, setMessage] = useState('')
	const [isSuccess, setIsSuccess] = useState(false)
	const [codeInput, setCodeInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const codeFromQuery = searchParams?.get('confirmationCode') ?? ''
	const hasCodeInQuery = useMemo(() => codeFromQuery.length > 0, [codeFromQuery])

	const confirmWithCode = useCallback(async (code: string): Promise<void> => {
		if (typeof API_URL !== 'string' || API_URL.length === 0) {
			setMessage('Server is not configured. Please try again later.')
			setIsSuccess(false)
			return
		}

		if (code.trim().length === 0) {
			setMessage('Please enter a confirmation code.')
			setIsSuccess(false)
			return
		}

		setIsLoading(true)
		setMessage('Confirming your email...')
		try {
			const encoded = encodeURIComponent(code.trim())
			const res = await axios.post(`${API_URL}/v1/users/confirm?confirmationCode=${encoded}`)
			setMessage(res?.data?.message ?? 'Confirmation successful! Your account has been activated.')
			setIsSuccess(true)
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setMessage(error.response?.data?.error ?? 'Confirmation unsuccessful. Please try again.')
			} else {
				setMessage('Confirmation unsuccessful. Please try again.')
			}
			setIsSuccess(false)
		} finally {
			setIsLoading(false)
		}
	}, [API_URL])

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
			{message !== '' && (
				<div className={`px-4 py-2 rounded border ${isSuccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
					<p>{message}</p>
				</div>
			)}

			{!hasCodeInQuery && !isSuccess && (
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
						disabled={isLoading}
						className="w-full rounded bg-indigo-600 text-white py-2 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Confirming…' : 'Confirm Email'}
					</button>
				</form>
			)}

			<div className="text-sm">
				{!isSuccess ? (
					<div>
						<span className="text-gray-700">{'Having trouble? '}</span>
						<Link href="/support" className="text-indigo-600 hover:text-indigo-900">{'Contact support'}</Link>
					</div>
				) : (
					<div>
						<Link href="/login" className="text-indigo-600 hover:text-indigo-900">{'Proceed to Login'}</Link>
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
