'use client'

import Link from 'next/link'
import { type ReactElement } from 'react'
import { FaLock } from 'react-icons/fa'

import { Card, CardContent, Button } from '@/components/ui'

interface AuthRequiredCardProps {
  title?: string
  message?: string
  redirectLabel?: string
  redirectHref?: string
  showSignup?: boolean
}

export default function AuthRequiredCard ({
  title = 'Authentication Required',
  message = 'Please log in to access this page.',
  redirectLabel = 'Log In',
  redirectHref = '/login',
  showSignup = true
}: AuthRequiredCardProps): ReactElement {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent>
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <FaLock className="text-6xl text-amber-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={redirectHref}>
              <Button variant="primary">{redirectLabel}</Button>
            </Link>
            {showSignup && (
              <Link href="/signup">
                <Button variant="secondary">{'Sign Up'}</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
