'use client'

import { Room } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Users, RotateCcw, Share2 } from 'lucide-react'

interface RoomHeaderProps {
  room: Room
  progress: number
  memberCount: number
  onBack: () => void
  onReset: () => void
}

export function RoomHeader({ room, progress, memberCount, onBack, onReset }: RoomHeaderProps) {
  const handleShare = async () => {
    const roomUrl = `${window.location.origin}/room/${room.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my puzzle room: ${room.name}`,
          text: `Let's solve this puzzle together!`,
          url: roomUrl,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(roomUrl)
        alert('Room link copied to clipboard!')
      } catch (error) {
        alert(`Share this link: ${roomUrl}`)
      }
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{room.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{room.puzzle_config.rows}×{room.puzzle_config.cols} pieces</span>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{memberCount} player{memberCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Progress Bar */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progress)}%
              </span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
