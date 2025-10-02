'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Download, Trash2, Cookie, Mail, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              FinFlow ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial tracking application.
            </p>
            <p className="text-sm text-muted-foreground">
              By using FinFlow, you agree to the collection and use of information in accordance with this policy. We are fully GDPR compliant and respect your data rights.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Information We Collect
            </CardTitle>
            <CardDescription>
              We collect only the data necessary to provide our services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Account Information</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Email address (provided by Google OAuth)</li>
                <li>Google account ID (for authentication)</li>
                <li>Profile information (name, if provided by Google)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Financial Data</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Transaction records (manually entered by you)</li>
                <li>Budget information</li>
                <li>Subscription details</li>
                <li>Categories and notes you create</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Usage Information</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Authentication tokens (stored as HTTP-only cookies)</li>
                <li>Session information</li>
                <li>Browser type and version</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
            <CardDescription>
              Your data is used exclusively to provide and improve our service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>To provide and maintain the FinFlow application</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>To authenticate your account and manage your sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>To store and display your financial data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>To generate analytics and reports for your personal use</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>To improve our service and user experience</span>
              </li>
            </ul>

            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                We will NEVER:
              </p>
              <ul className="space-y-1 text-sm text-green-700 dark:text-green-300 mt-2">
                <li>• Sell your personal data to third parties</li>
                <li>• Share your financial information with advertisers</li>
                <li>• Use your data for purposes other than providing our service</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Storage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Data Storage & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Where We Store Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Your data is stored securely on Supabase's infrastructure, which uses PostgreSQL databases hosted on AWS servers in the EU (Frankfurt region). All data is encrypted in transit (HTTPS/TLS) and at rest (AES-256).
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Row-Level Security</h3>
              <p className="text-sm text-muted-foreground">
                We implement database-level Row-Level Security (RLS) policies, ensuring that you can only access your own data. Even our administrators cannot view your financial information without explicit authorization.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                We use Google OAuth 2.0 for authentication, which means we never store your password. Authentication tokens are stored as HTTP-only cookies and automatically expire after a period of inactivity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* GDPR Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Your GDPR Rights
            </CardTitle>
            <CardDescription>
              As an EU citizen, you have full control over your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">Right to Access</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export all your data as JSON from the sidebar or settings page
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <h3 className="font-semibold">Right to Erasure</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Delete your account and all associated data permanently from settings
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold">Right to Rectification</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Edit or update any of your data directly in the app
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold">Right to Portability</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Download your data in machine-readable formats (JSON, Excel)
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
              <p className="text-sm">
                To exercise any of these rights, visit your{' '}
                <Link href="/dashboard/settings" className="font-semibold text-blue-600 hover:underline">
                  Settings page
                </Link>
                {' '}or contact us at utszelenallojelzotable@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-orange-600" />
              Cookies & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We use only essential cookies required for authentication and security:
            </p>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h3 className="font-semibold text-sm mb-1">Authentication Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  HTTP-only cookies that store your session tokens. These are essential for the app to function and cannot be disabled.
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              We do NOT use:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• Advertising cookies</li>
              <li>• Tracking cookies</li>
              <li>• Analytics cookies (from third parties)</li>
              <li>• Social media cookies</li>
            </ul>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We use the following trusted third-party services:
            </p>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h3 className="font-semibold text-sm mb-1">Google OAuth</h3>
                <p className="text-sm text-muted-foreground">
                  For secure authentication. Google's Privacy Policy:{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    https://policies.google.com/privacy
                  </a>
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <h3 className="font-semibold text-sm mb-1">Supabase</h3>
                <p className="text-sm text-muted-foreground">
                  For database and authentication infrastructure. Supabase Privacy Policy:{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    https://supabase.com/privacy
                  </a>
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <h3 className="font-semibold text-sm mb-1">Vercel</h3>
                <p className="text-sm text-muted-foreground">
                  For hosting and deployment. Vercel Privacy Policy:{' '}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    https://vercel.com/legal/privacy-policy
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Communications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" />
              Email Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We may send you emails for:
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Essential notifications:</strong> Account security, service updates, and important changes (you cannot opt out of these)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Optional updates:</strong> New features, tips, and product news (you can opt out anytime from settings)</span>
              </li>
            </ul>

            <p className="text-sm text-muted-foreground">
              You can manage your email preferences in your account settings.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We retain your data for as long as your account is active or as needed to provide you services. When you delete your account:
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• All your financial data is immediately and permanently deleted</li>
              <li>• Your authentication tokens are invalidated</li>
              <li>• Your account cannot be recovered</li>
              <li>• We may retain minimal anonymized usage statistics for up to 30 days</li>
            </ul>

            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400 mt-4">
              Important: Account deletion is permanent and cannot be undone. Please export your data before deletion if you wish to keep it.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              FinFlow is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>

            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• Posting the new Privacy Policy on this page</li>
              <li>• Updating the "Last updated" date at the top</li>
              <li>• Sending you an email notification (for significant changes)</li>
            </ul>

            <p className="text-sm text-muted-foreground">
              Your continued use of FinFlow after any changes indicates your acceptance of the updated Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>

            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-mono">
                Email: utszelenallojelzotable@gmail.com
              </p>
              <p className="text-sm font-mono mt-2">
                Data Protection Officer: utszelenallojelzotable@gmail.com
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              We aim to respond to all privacy inquiries within 48 hours.
            </p>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/dashboard/settings" className="hover:underline">
            Settings
          </Link>
          <span>•</span>
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span>•</span>
          <a href="mailto:utszelenallojelzotable@gmail.com" className="hover:underline">
            Contact
          </a>
        </div>
      </div>
    </div>
  )
}
