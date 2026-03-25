'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppHome() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/app/inbox')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  )
}
