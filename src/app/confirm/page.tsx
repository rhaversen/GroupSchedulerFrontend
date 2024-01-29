'use client'
import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from '@/styles/userInput.module.scss'
import useConfirmEmail from '@/hooks/useConfirmEmail'
import LinkButton from '@/components/ui/LinkButton'
import MessageDisplay from '@/components/ui/MessageDisplay'

const ConfirmEmailContent = (): JSX.Element => {
    const searchParams = useSearchParams()
    const confirmationCode = searchParams ? searchParams.get('confirmationCode') : null
    const { message, isSuccess } = useConfirmEmail(confirmationCode)

    return (
        <div>
            <MessageDisplay message={message} />
            {!isSuccess
                ? (
                    <LinkButton href="/support" prefixText='Having trouble?' buttonText="Contact support" />
                )
                : (
                    <LinkButton href="/login" buttonText="Proceed to Login" />
                )}
        </div>
    )
}

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div></div>}>
        {children}
    </Suspense>
)

const ConfirmEmail = (): JSX.Element => (
    <div className={styles.container}>
        <div className={styles.form}>
            <SuspenseWrapper>
                <ConfirmEmailContent />
            </SuspenseWrapper>
        </div>
    </div>
)

export default ConfirmEmail