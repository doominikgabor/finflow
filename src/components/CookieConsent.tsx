'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cookie, X } from 'lucide-react'

export function CookieConsent() {
  // State to control whether the banner is visible
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    // We store this preference in localStorage (browser storage)
    const hasAcceptedCookies = localStorage.getItem('cookieConsent')

    // If they haven't accepted yet, show the banner
    if (!hasAcceptedCookies) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    // Store acceptance in localStorage
    // This prevents the banner from showing again
    localStorage.setItem('cookieConsent', 'accepted')

    // Hide the banner with a smooth fade-out
    setShowBanner(false)
  }

  const handleDecline = () => {
    // Even if declined, we still need to remember the choice
    // so we don't keep showing the banner on every page
    localStorage.setItem('cookieConsent', 'acknowledged')
    setShowBanner(false)
  }

  // Don't render anything if banner shouldn't be shown
  if (!showBanner) {
    return null
  }

  return (
    <>
      {/* Backdrop - slight dark overlay behind the banner */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  Cookie Notice
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  We use only <strong>essential cookies</strong> required for authentication and security.
                  We do not use advertising, tracking, or analytics cookies.
                  By continuing to use FinFlow, you acknowledge our use of essential cookies.{' '}
                  <Link
                    href="/privacy"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Learn more in our Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleAccept}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Got it
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
