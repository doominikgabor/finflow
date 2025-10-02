'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Trash2, User, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()

  const handleExportData = () => {
    window.open('/api/export-data', '_blank')
    toast.success('Data export started', {
      description: 'Your data will download as a JSON file.'
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and data
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input value={user?.email || ''} disabled className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Signed in with Google OAuth
            </p>
          </div>
          <div>
            <Label>User ID</Label>
            <Input value={user?.id || ''} disabled className="mt-2 font-mono text-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download all your financial data in JSON format (GDPR compliant)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExportData}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data as JSON
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            This will download a file containing all your transactions, budgets, subscriptions, and preferences.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Request permanent deletion of your account and all data (GDPR compliant)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To delete your account and all associated data, please contact us at:
          </p>
          <a
            href="mailto:utszelenallojelzotable@gmail.com?subject=FinFlow%20Account%20Deletion%20Request&body=Hello%2C%0A%0AI%20would%20like%20to%20request%20the%20deletion%20of%20my%20FinFlow%20account.%0A%0AAccount%20Email%3A%20%5BYour%20email%20here%5D%0AUser%20ID%3A%20%5BYour%20user%20ID%20here%5D%0A%0AThank%20you."
            className="inline-flex items-center gap-2 font-mono text-sm text-blue-600 hover:underline"
          >
            <Trash2 className="h-4 w-4" />
            utszelenallojelzotable@gmail.com
          </a>
          <div className="p-4 bg-white border border-red-200 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-red-700">
              What will be deleted:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All transactions</li>
              <li>All budgets and subscriptions</li>
              <li>All preferences and settings</li>
              <li>Your account and login access</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            We will process your request within 30 days as required by GDPR.
            This action cannot be undone - please export your data before requesting deletion.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
