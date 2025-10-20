'use client'

import { useParams } from 'next/navigation'
import { PuzzleGame } from '@/components/puzzle/PuzzleGame'
import { useAuth } from '@/components/providers/AuthProvider'
import { Loader2 } from 'lucide-react'

export default function RoomPage() {
  const params = useParams()
  const { user, loading } = useAuth()
  const roomId = params.id as string

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to join this puzzle room.</p>
        </div>
      </div>
    )
  }

  return <PuzzleGame roomId={roomId} />
}
