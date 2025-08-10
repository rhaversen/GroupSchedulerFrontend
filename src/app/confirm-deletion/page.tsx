'use client'

import { isAxiosError } from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ReactElement, Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { useUser } from '@/contexts/UserProvider'
import { useLogout } from '@/hooks/useLogout'
import { api } from '@/lib/api'

const ConfirmDeletionInner = (): ReactElement => {
	const searchParams = useSearchParams()
	const router = useRouter()
	const { logout } = useLogout()
	const { currentUser } = useUser()

	const [message, setMessage] = useState('')
	const [isSuccess, setIsSuccess] = useState(false)
	const [isError, setIsError] = useState(false)
	const [codeInput, setCodeInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [showConfirmation, setShowConfirmation] = useState(false)

	const codeFromQuery = searchParams?.get('deletionCode') ?? ''
	const hasCodeInQuery = useMemo(() => codeFromQuery.length > 0, [codeFromQuery])

	const confirmDeletion = useCallback(async (code: string): Promise<void> => {
		if (code.trim().length === 0) {
			setMessage('Please enter a deletion code.')
			setIsSuccess(false)
			setIsError(true)
			return
		}

		setIsLoading(true)
		setIsError(false)
		setMessage('Deleting your account...')

		try {
			const encoded = encodeURIComponent(code.trim())
			await api.delete(`/v1/users/confirm-deletion?deletionCode=${encoded}`)

			setMessage('Your account has been successfully deleted.')
			setIsSuccess(true)
			setIsError(false)

			logout()
		} catch (error) {
			if (isAxiosError(error)) {
				setMessage(error.response?.data?.error ?? 'Account deletion failed. Please check your deletion code and try again.')
			} else {
				setMessage('Account deletion failed. Please try again.')
			}
			setIsSuccess(false)
			setIsError(true)
		} finally {
			setIsLoading(false)
		}
	}, [logout])

	const requestNewDeletionCode = useCallback(() => {
		router.push('/profile')
	}, [router])

	useEffect(() => {
		if (!hasCodeInQuery) {
			setMessage('')
			setIsSuccess(false)
			setShowConfirmation(false)
			return
		}

		// Show confirmation dialog first when code is in query
		setShowConfirmation(true)
	}, [hasCodeInQuery])

	const proceedWithDeletion = useCallback(() => {
		if (hasCodeInQuery) {
			confirmDeletion(codeFromQuery).catch(() => {
				setMessage('Account deletion failed. Please try again.')
				setIsSuccess(false)
			})
		}
		setShowConfirmation(false)
	}, [hasCodeInQuery, codeFromQuery, confirmDeletion])

	return (
		<div className="w-full max-w-md space-y-4">
			<div className="text-center mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">{'Confirm Account Deletion'}</h1>
				<p className="text-gray-600">
					{showConfirmation
						? 'Please confirm that you want to delete your account'
						: 'Enter the deletion code sent to your email to permanently delete your account.'
					}
				</p>
			</div>

			{/* Confirmation Step for Query Param */}
			{showConfirmation && hasCodeInQuery && (
				<div className="space-y-4">
					{currentUser && (
						<div className="bg-gray-50 rounded-lg p-4">
							<h3 className="text-sm font-medium text-gray-700 mb-2">{'Account to be deleted:'}</h3>
							<div className="space-y-1 text-sm text-gray-600">
								<p><span className="font-medium">{'Email:'}</span> {currentUser.email}</p>
								<p><span className="font-medium">{'Username:'}</span> {currentUser.username}</p>
							</div>
						</div>
					)}

					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<div className="flex items-start">
							<span className="text-red-500 text-lg mr-3">{'⚠️'}</span>
							<div>
								<h3 className="text-sm font-medium text-red-800 mb-1">{'Final Warning'}</h3>
								<p className="text-sm text-red-700">
									{'This action cannot be undone. All your events, data, and connections will be permanently removed.\r'}
								</p>
							</div>
						</div>
					</div>

					<div className="flex space-x-3">
						<button
							onClick={() => {
								setShowConfirmation(false)
								router.push('/dashboard')
							}}
							className="flex-1 rounded-lg bg-gray-200 text-gray-800 py-3 px-4 hover:bg-gray-300 transition-colors"
						>
							{'Cancel\r'}
						</button>
						<button
							onClick={proceedWithDeletion}
							disabled={isLoading}
							className="flex-1 rounded-lg bg-red-600 text-white py-3 px-4 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
						>
							{isLoading ? 'Deleting...' : 'Delete My Account'}
						</button>
					</div>
				</div>
			)}

			{message !== '' && !showConfirmation && (
				<div className={`px-4 py-3 rounded-lg border ${
					isError
						? 'bg-red-50 border-red-200 text-red-800'
						: isSuccess
							? 'bg-green-50 border-green-200 text-green-800'
							: 'bg-blue-50 border-blue-200 text-blue-800'
				}`}>
					<p className="text-sm font-medium">{message}</p>
				</div>
			)}

			{!isSuccess && !hasCodeInQuery && !showConfirmation && (
				<form
					className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
					onSubmit={(e) => {
						e.preventDefault()
						void confirmDeletion(codeInput)
					}}
				>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="deletionCode">
							{'Deletion Code\r'}
						</label>
						<input
							id="deletionCode"
							type="text"
							value={codeInput}
							onChange={(e) => setCodeInput(e.target.value)}
							placeholder="Enter your deletion code"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
							autoComplete="one-time-code"
						/>
					</div>

					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<div className="flex items-start">
							<span className="text-red-500 text-lg mr-3">{'⚠️'}</span>
							<div>
								<h3 className="text-sm font-medium text-red-800 mb-1">{'Warning'}</h3>
								<p className="text-sm text-red-700">
									{'This action cannot be undone. All your events, data, and connections will be permanently removed.\r'}
								</p>
							</div>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading || codeInput.trim().length === 0}
						className="w-full rounded-lg bg-red-600 text-white py-2 px-4 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
					>
						{isLoading ? 'Deleting Account...' : 'Delete My Account'}
					</button>
				</form>
			)}

			{!isSuccess && !showConfirmation && (
				<div className="text-center space-y-2">
					<button
						type="button"
						onClick={requestNewDeletionCode}
						className="text-sm text-red-600 hover:text-red-800 underline"
					>
						{'Request a new deletion code\r'}
					</button>
					<div className="text-sm text-gray-600">
						<span>{'Changed your mind? '}</span>
						<Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 underline">
							{'Return to dashboard\r'}
						</Link>
					</div>
				</div>
			)}

			{isSuccess && (
				<Link href="/" className="w-full flex justify-center text-center text-indigo-600 hover:text-indigo-800 underline">
					{'Go to Home Page'}
				</Link>
			)}
		</div>
	)
}

const ConfirmDeletion = (): ReactElement => (
	<main className="p-5 flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black">
		<Suspense fallback={
			<div className="w-full max-w-md">
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
					<div className="h-32 bg-gray-200 rounded"></div>
				</div>
			</div>
		}>
			<ConfirmDeletionInner />
		</Suspense>
	</main>
)

export default ConfirmDeletion
