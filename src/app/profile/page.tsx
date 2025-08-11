'use client'

import axios from 'axios'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { FaEye, FaUser, FaLock, FaShieldAlt, FaCheck, FaExclamationTriangle, FaTrash, FaArrowRight } from 'react-icons/fa'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'

import AuthRequiredCard from '@/components/AuthRequiredCard'
import Navigation from '@/components/Navigation'
import PageHero from '@/components/PageHero'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useUser } from '@/contexts/UserProvider'
import { useLogout } from '@/hooks/useLogout'
import { api } from '@/lib/api'

export default function ProfilePage () {
	const { currentUser, setCurrentUser, userLoading } = useUser()
	const { logout } = useLogout()

	const [profileData, setProfileData] = useState({
		username: currentUser?.username ?? ''
	})
	const [saving, setSaving] = useState(false)

	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmNewPassword: ''
	})
	const [changingPassword, setChangingPassword] = useState(false)
	const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
	const [passwordChangeError, setPasswordChangeError] = useState('')
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false
	})

	const [deletionStep, setDeletionStep] = useState<'initial' | 'codeRequested'>('initial')
	const [deletionCode, setDeletionCode] = useState('')
	const [deletionError, setDeletionError] = useState('')
	const [requestingDeletion, setRequestingDeletion] = useState(false)
	const [confirmingDeletion, setConfirmingDeletion] = useState(false)

	const validatePasswordForm = (): boolean => {
		return (
			passwordData.currentPassword != null &&
			passwordData.newPassword != null &&
			passwordData.confirmNewPassword != null &&
			passwordData.newPassword === passwordData.confirmNewPassword &&
			passwordData.newPassword.length >= 4
		)
	}

	const saveProfile = useCallback(async () => {
		if (!currentUser) { return }

		try {
			setSaving(true)
			const response = await api.patch(`/v1/users/${currentUser._id}`, {
				username: profileData.username
			})
			setCurrentUser(response.data)
		} catch (error) {
			console.error('Failed to update profile:', error)
		} finally {
			setSaving(false)
		}
	}, [profileData, currentUser, setCurrentUser])

	const changePassword = useCallback(async () => {
		try {
			setChangingPassword(true)
			setPasswordChangeSuccess(false)
			setPasswordChangeError('')
			await api.patch('/v1/users/me/password', {
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
				confirmNewPassword: passwordData.confirmNewPassword
			})

			setPasswordData({
				currentPassword: '',
				newPassword: '',
				confirmNewPassword: ''
			})
			setPasswordChangeSuccess(true)
		} catch (error: unknown) {
			console.error('Failed to change password:', error)

			if (axios.isAxiosError(error) && error.response?.status === 400) {
				setPasswordChangeError('Current password is incorrect')
			} else {
				setPasswordChangeError('Failed to change password. Please try again.')
			}
		} finally {
			setChangingPassword(false)
		}
	}, [passwordData])

	const requestAccountDeletion = useCallback(async () => {
		if (!currentUser) { return }

		try {
			setRequestingDeletion(true)
			await api.post(`/v1/users/${currentUser._id}/request-deletion`)
			setDeletionStep('codeRequested')
		} catch (error) {
			console.error('Failed to request account deletion:', error)
		} finally {
			setRequestingDeletion(false)
		}
	}, [currentUser])

	const confirmAccountDeletion = useCallback(async () => {
		try {
			setConfirmingDeletion(true)
			setDeletionError('')
			await api.delete(`/v1/users/confirm-deletion?deletionCode=${deletionCode}`)
			logout('/')
		} catch (error: unknown) {
			console.error('Failed to confirm account deletion:', error)

			if (axios.isAxiosError(error) && error.response?.status === 400) {
				setDeletionError('Invalid deletion code')
			} else {
				setDeletionError('Failed to delete account. Please try again.')
			}
		} finally {
			setConfirmingDeletion(false)
		}
	}, [deletionCode, logout])

	if (userLoading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10 space-y-8">
					<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-10 text-white animate-pulse">
						<div className="h-10 bg-white/30 rounded w-1/3 mb-6" />
						<div className="h-4 bg-white/20 rounded w-2/3" />
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{Array.from({ length: 2 }).map((_, i) => (
							<div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />
						))}
					</div>
				</div>
			</div>
		)
	}

	if (!currentUser) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
					<AuthRequiredCard title="Profile Access" message="Please log in to manage your profile and account settings." />
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-10">
				<div className="space-y-10">
					<PageHero
						title="Profile Settings"
						subtitle="Manage your account settings, security, and preferences."
					>
						{currentUser != null && (
							<div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-50 shadow-lg">
								<div className="flex items-start gap-4">
									<div className="text-3xl text-indigo-600"><FaEye /></div>
									<div className="flex-1">
										<div className="text-indigo-800 font-semibold text-lg mb-1">
											{'View Your Public Profile'}
										</div>
										<div className="text-indigo-700 text-sm mb-3">
											{'See how your profile appears to other users'}
										</div>
										<Link
											href={`/people/${currentUser._id}`}
											className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-200 hover:underline"
										>
											<span>{'View Public Profile'}</span>
											<span className="text-xs"><FaArrowRight /></span>
										</Link>
									</div>
								</div>
							</div>
						)}
					</PageHero>

					{/* Profile Information */}
					<Card className="border-0 shadow-lg">
						<CardHeader className="pb-6">
							<CardTitle className="text-2xl flex items-center gap-3">
								<span className="text-2xl text-blue-600"><FaUser /></span>
								{'Profile Information'}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
									{'Email'}
								</label>
								<input
									type="email"
									id="email"
									value={currentUser.email ?? ''}
									disabled
									className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
								/>
								<p className="text-sm text-gray-500 mt-2">{'Email cannot be changed'}</p>
							</div>
							<div>
								<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
									{'Username'}
								</label>
								<input
									type="text"
									id="username"
									value={profileData.username}
									onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
									placeholder="Enter your username"
								/>
							</div>
							<Button
								onClick={saveProfile}
								disabled={saving || profileData.username === currentUser.username}
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3"
							>
								{saving ? 'Saving...' : 'Save Changes'}
							</Button>
						</CardContent>
					</Card>

					{/* Security Settings */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Change Password */}
						<Card className="border-0 shadow-lg">
							<CardHeader className="pb-6">
								<CardTitle className="text-2xl flex items-center gap-3">
									<span className="text-2xl text-amber-600"><FaLock /></span>
									{'Change Password'}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
										{'Current Password'}
									</label>
									<div className="relative">
										<input
											type={showPasswords.current ? 'text' : 'password'}
											id="currentPassword"
											value={passwordData.currentPassword}
											onChange={(e) => {
												setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))
												setPasswordChangeSuccess(false)
												setPasswordChangeError('')
											}}
											className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
											placeholder="Enter current password"
										/>
										<button
											type="button"
											tabIndex={-1}
											onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
											className="absolute inset-y-0 right-0 pr-4 flex items-center"
										>
											{showPasswords.current ? (
												<HiOutlineEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
											) : (
												<HiOutlineEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
											)}
										</button>
									</div>
								</div>
								<div>
									<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
										{'New Password'}
									</label>
									<div className="relative">
										<input
											type={showPasswords.new ? 'text' : 'password'}
											id="newPassword"
											value={passwordData.newPassword}
											onChange={(e) => {
												setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
												setPasswordChangeSuccess(false)
												setPasswordChangeError('')
											}}
											className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
											placeholder="Enter new password (min 4 characters)"
										/>
										<button
											type="button"
											tabIndex={-1}
											onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
											className="absolute inset-y-0 right-0 pr-4 flex items-center"
										>
											{showPasswords.new ? (
												<HiOutlineEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
											) : (
												<HiOutlineEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
											)}
										</button>
									</div>
								</div>
								<div>
									<label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
										{'Confirm New Password'}
									</label>
									<div className="relative">
										<input
											type={showPasswords.confirm ? 'text' : 'password'}
											id="confirmNewPassword"
											value={passwordData.confirmNewPassword}
											onChange={(e) => {
												setPasswordData(prev => ({ ...prev, confirmNewPassword: e.target.value }))
												setPasswordChangeSuccess(false)
												setPasswordChangeError('')
											}}
											className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
											placeholder="Confirm new password"
										/>
										<button
											type="button"
											tabIndex={-1}
											onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
											className="absolute inset-y-0 right-0 pr-4 flex items-center"
										>
											{showPasswords.confirm ? (
												<HiOutlineEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
											) : (
												<HiOutlineEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
											)}
										</button>
									</div>
								</div>
								{passwordData.newPassword && passwordData.confirmNewPassword && passwordData.newPassword !== passwordData.confirmNewPassword && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-4">
										<p className="text-red-700 text-sm font-medium">{'Passwords do not match'}</p>
									</div>
								)}
								{passwordData.newPassword && passwordData.newPassword.length < 4 && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-4">
										<p className="text-red-700 text-sm font-medium">{'Password must be at least 4 characters'}</p>
									</div>
								)}
								{passwordChangeSuccess && (
									<div className="bg-green-50 border border-green-200 rounded-lg p-4">
										<p className="text-green-700 text-sm font-medium">{'Password changed successfully!'}</p>
									</div>
								)}
								{passwordChangeError && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-4">
										<p className="text-red-700 text-sm font-medium">{passwordChangeError}</p>
									</div>
								)}
								<Button
									onClick={changePassword}
									disabled={changingPassword || !validatePasswordForm()}
									className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 w-full"
								>
									{changingPassword ? 'Changing Password...' : 'Change Password'}
								</Button>
							</CardContent>
						</Card>

						{/* Account Security Tips */}
						<Card className="border-0 shadow-lg">
							<CardHeader className="pb-6">
								<CardTitle className="text-2xl flex items-center gap-3">
									<span className="text-2xl text-green-600"><FaShieldAlt /></span>
									{'Security Tips'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4 text-gray-600">
									<div className="flex items-start gap-3">
										<span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5"><FaCheck /></span>
										<span>{'Use a strong password with at least 4 characters'}</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5"><FaCheck /></span>
										<span>{'Include numbers, letters, and special characters'}</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5"><FaCheck /></span>
										<span>{'Don\'t reuse passwords from other accounts'}</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5"><FaCheck /></span>
										<span>{'Update your password regularly'}</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5"><FaCheck /></span>
										<span>{'Keep your account information up to date'}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Danger Zone */}
					<Card className="border-0 shadow-lg">
						<CardHeader className="pb-6">
							<CardTitle className="text-2xl flex items-center gap-3 text-red-600">
								<span className="text-2xl"><FaExclamationTriangle /></span>
								{'Danger Zone'}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="p-6 border border-red-200 rounded-xl bg-red-50">
								<div className="flex items-start gap-4">
									<span className="text-3xl text-red-500"><FaTrash /></span>
									<div className="flex-1">
										<h3 className="text-xl font-semibold text-red-800 mb-3">{'Delete Account'}</h3>
										{deletionStep === 'initial' && (
											<>
												<p className="text-red-700 mb-6 text-lg">
													{'Once you delete your account, there is no going back. All your events, data, and connections will be permanently removed.'}
												</p>
												<div className="space-y-4">
													<Button
														onClick={requestAccountDeletion}
														disabled={requestingDeletion}
														className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
													>
														{requestingDeletion ? 'Sending Email...' : 'Request Account Deletion'}
													</Button>
													<div>
														<button
															type="button"
															onClick={() => setDeletionStep('codeRequested')}
															className="text-red-600 hover:text-red-700 underline text-sm"
														>
															{'I already have a deletion code'}
														</button>
													</div>
												</div>
											</>
										)}
										{deletionStep === 'codeRequested' && (
											<>
												<p className="text-red-700 mb-4 text-lg">
													{'A deletion confirmation email has been sent to your email address. Please check your inbox and enter the deletion code below.'}
												</p>
												<div className="space-y-4">
													<div>
														<label htmlFor="deletionCode" className="block text-sm font-medium text-red-700 mb-2">
															{'Deletion Code'}
														</label>
														<input
															type="text"
															id="deletionCode"
															value={deletionCode}
															onChange={(e) => {
																setDeletionCode(e.target.value)
																setDeletionError('')
															}}
															className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
															placeholder="Enter deletion code from email"
														/>
													</div>
													{deletionError && (
														<div className="bg-red-50 border border-red-200 rounded-lg p-4">
															<p className="text-red-700 text-sm font-medium">{deletionError}</p>
														</div>
													)}
													<div className="flex gap-3">
														<Button
															onClick={confirmAccountDeletion}
															disabled={confirmingDeletion || !deletionCode.trim()}
															className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
														>
															{confirmingDeletion ? 'Deleting Account...' : 'Confirm Deletion'}
														</Button>
														<Button
															onClick={() => {
																setDeletionStep('initial')
																setDeletionCode('')
																setDeletionError('')
															}}
															className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3"
														>
															{'Cancel'}
														</Button>
													</div>
												</div>
											</>
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
