'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase, Room, PuzzlePiece } from '@/lib/supabase'
import { PuzzleBoard } from './PuzzleBoard'
import { PuzzlePieces } from './PuzzlePieces'
import { RoomHeader } from './RoomHeader'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Users, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { calculatePuzzleProgress } from '@/lib/puzzle'

interface PuzzleGameProps {
  roomId: string
}

export function PuzzleGame({ roomId }: PuzzleGameProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [roomMembers, setRoomMembers] = useState<any[]>([])

  // Join room as member
  const joinRoom = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('room_members')
        .upsert({
          room_id: roomId,
          user_id: user.id,
          is_active: true,
        })

      if (error) throw error
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }, [user, roomId])

  // Fetch room data
  const fetchRoom = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (error) throw error
      setRoom(data)
    } catch (error: any) {
      setError(error.message)
    }
  }, [roomId])

  // Fetch puzzle pieces
  const fetchPieces = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('puzzle_pieces')
        .select('*')
        .eq('room_id', roomId)
        .order('piece_index')

      if (error) throw error
      setPieces(data || [])
      
      // Calculate progress
      const progress = calculatePuzzleProgress(data || [])
      setProgress(progress)
    } catch (error: any) {
      console.error('Error fetching pieces:', error)
    }
  }, [roomId])

  // Fetch room members
  const fetchRoomMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('room_members')
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `)
        .eq('room_id', roomId)
        .eq('is_active', true)

      if (error) throw error
      setRoomMembers(data || [])
    } catch (error) {
      console.error('Error fetching room members:', error)
    }
  }, [roomId])

  // Update piece position
  const updatePiecePosition = useCallback(async (pieceId: string, x: number, y: number, isPlaced: boolean) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('puzzle_pieces')
        .update({
          current_x: x,
          current_y: y,
          is_placed: isPlaced,
          last_moved_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pieceId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating piece:', error)
    }
  }, [user])

  // Reset puzzle
  const resetPuzzle = useCallback(async () => {
    if (!confirm('Are you sure you want to reset the puzzle? All progress will be lost.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('puzzle_pieces')
        .update({
          current_x: Math.random() * 400 + 50,
          current_y: Math.random() * 300 + 50,
          is_placed: false,
          rotation: 0,
          last_moved_by: user?.id,
        })
        .eq('room_id', roomId)

      if (error) throw error
      
      fetchPieces()
    } catch (error) {
      console.error('Error resetting puzzle:', error)
    }
  }, [roomId, user, fetchPieces])

  // Set up realtime subscriptions
  useEffect(() => {
    if (!roomId) return

    // Join room
    joinRoom()

    // Fetch initial data
    const loadData = async () => {
      await Promise.all([
        fetchRoom(),
        fetchPieces(),
        fetchRoomMembers(),
      ])
      setLoading(false)
    }

    loadData()

    // Subscribe to puzzle piece changes
    const piecesSubscription = supabase
      .channel(`puzzle-pieces-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'puzzle_pieces',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchPieces()
        }
      )
      .subscribe()

    // Subscribe to room member changes
    const membersSubscription = supabase
      .channel(`room-members-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchRoomMembers()
        }
      )
      .subscribe()

    return () => {
      piecesSubscription.unsubscribe()
      membersSubscription.unsubscribe()
    }
  }, [roomId, joinRoom, fetchRoom, fetchPieces, fetchRoomMembers])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This puzzle room does not exist.'}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <RoomHeader
        room={room}
        progress={progress}
        memberCount={roomMembers.length}
        onBack={() => router.push('/')}
        onReset={resetPuzzle}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Puzzle Board */}
          <div className="lg:col-span-2">
            <PuzzleBoard
              room={room}
              pieces={pieces}
              onPieceUpdate={updatePiecePosition}
            />
          </div>

          {/* Puzzle Pieces */}
          <div className="lg:col-span-1">
            <PuzzlePieces
              pieces={pieces}
              room={room}
              onPieceUpdate={updatePiecePosition}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
