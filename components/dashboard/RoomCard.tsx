'use client'

import { useState } from 'react'
import { Room } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Play, Users, Trash2, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface RoomCardProps {
  room: Room
  onRoomUpdated: () => void
}

export function RoomCard({ room, onRoomUpdated }: RoomCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePlay = () => {
    router.push(`/room/${room.id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', room.id)

      if (error) throw error
      
      onRoomUpdated()
    } catch (error) {
      console.error('Error deleting room:', error)
      alert('Failed to delete room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-100 relative">
        <img
          src={room.image_url}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(room.puzzle_config.difficulty)}`}>
            {room.puzzle_config.difficulty}
          </span>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{room.name}</CardTitle>
        <CardDescription>
          {room.puzzle_config.rows}×{room.puzzle_config.cols} pieces
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>Collaborative</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="p-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handlePlay}
              className="flex items-center space-x-1"
            >
              <Play className="h-4 w-4" />
              <span>Play</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
