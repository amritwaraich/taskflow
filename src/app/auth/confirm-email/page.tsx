import Link from 'next/link'
import { Mail, CheckCircle } from 'lucide-react'

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-500 mb-8">
          We've sent you a confirmation email. Please click the link in the email to activate your account.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
