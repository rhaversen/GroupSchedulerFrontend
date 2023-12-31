import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import styles from './userInput.module.scss'

const API_V1_URL = process.env.NEXT_PUBLIC_API_V1_URL ?? ''

function Confirm (): JSX.Element {
    const [message, setMessage] = useState<string>('Confirmation missing')
    const [isSuccess, setIsSuccess] = useState<boolean>(false)
    const router = useRouter()

    useEffect(() => {
        const confirmationCode = router.query.confirmationCode as string | undefined
        if (!router.isReady || confirmationCode === '' || confirmationCode == null) return

        confirmEmail(confirmationCode)
    }, [router.isReady, router.query.confirmationCode])

    const confirmEmail = (confirmationCode: string): void => {
        setMessage('Confirming your email...')

        // Encode URI component by escaping special characters
        const encodedConfirmationCode = encodeURIComponent(confirmationCode)

        axios.post(API_V1_URL + 'users/confirm?confirmationCode=' + encodedConfirmationCode)
            .then(response => {
                console.info(response)

                const serverMessage = response?.data?.message ?? 'Confirmation successful! Your account has been activated.'
                setMessage(serverMessage)

                setIsSuccess(true)
            })
            .catch(error => {
                console.error('Error confirming user:', error)

                const serverError = error.response?.data?.error ?? 'Confirmation unsuccessful. Please try again.'
                setMessage(serverError)
            })
    }

    const goToLogin = (): void => {
        router.push('/login')
            .catch((error) => {
                console.error('Router push error:', error)
            })
    }

    const goToSupport = (): void => {
        router.push('/support')
            .catch((error) => {
                console.error('Router push error:', error)
            })
    }

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <p className={styles.message}>{message}</p>
                {!isSuccess && (
                    <p className={styles.redirectPrompt}>
                        Having trouble?{' '}
                        <span className={styles.redirectLink} onClick={goToSupport}>
                        Contact support
                        </span>
                    </p>
                )}
                {isSuccess && (
                    <button
                        className={styles.submitButton}
                        onClick={goToLogin}
                    >
                        Proceed to Login
                    </button>
                )}
            </div>
        </div>
    )
}

export default Confirm
