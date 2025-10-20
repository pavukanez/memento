'use client'

import React, { useState, useRef, useCallback } from 'react'
import { PuzzlePiece, Room } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

interface PuzzlePiecesProps {
  pieces: PuzzlePiece[]
  room: Room
  onPieceUpdate: (pieceId: string, x: number, y: number, isPlaced: boolean) => void
}

export function PuzzlePieces({ pieces, room, onPieceUpdate }: PuzzlePiecesProps) {
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent, piece: PuzzlePiece) => {
    if (piece.is_placed) return

    e.preventDefault()
    setDraggedPiece(piece)
    
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent, piece: PuzzlePiece) => {
    if (piece.is_placed) return

    e.preventDefault()
    setDraggedPiece(piece)
    
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    })
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedPiece) return

    const x = e.clientX - dragOffset.x
    const y = e.clientY - dragOffset.y

    onPieceUpdate(draggedPiece.id, x, y, false)
  }, [draggedPiece, dragOffset, onPieceUpdate])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!draggedPiece) return

    e.preventDefault()
    const touch = e.touches[0]
    const x = touch.clientX - dragOffset.x
    const y = touch.clientY - dragOffset.y

    onPieceUpdate(draggedPiece.id, x, y, false)
  }, [draggedPiece, dragOffset, onPieceUpdate])

  const handleMouseUp = useCallback(() => {
    setDraggedPiece(null)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setDraggedPiece(null)
  }, [])

  // Add event listeners for drag
  React.useEffect(() => {
    if (draggedPiece) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [draggedPiece, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const unplacedPieces = pieces.filter(piece => !piece.is_placed)
  const placedPieces = pieces.filter(piece => piece.is_placed)

  return (
    <div className="space-y-6">
      {/* Unplaced Pieces */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Puzzle Pieces</CardTitle>
          <CardDescription>
            {unplacedPieces.length} pieces remaining
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unplacedPieces.map((piece) => (
              <div
                key={piece.id}
                className="puzzle-piece aspect-square border-2 border-gray-300 rounded-lg cursor-grab hover:border-primary-400 transition-colors"
                style={{
                  backgroundImage: `url(${room.image_url})`,
                  backgroundSize: `${room.puzzle_config.cols * 100}px ${room.puzzle_config.rows * 100}px`,
                  backgroundPosition: `-${(piece.piece_index % room.puzzle_config.cols) * 100}px -${Math.floor(piece.piece_index / room.puzzle_config.cols) * 100}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, piece)}
                onTouchStart={(e) => handleTouchStart(e, piece)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placed Pieces */}
      {placedPieces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Completed Pieces</CardTitle>
            <CardDescription>
              {placedPieces.length} pieces placed correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {placedPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="aspect-square border-2 border-green-500 rounded-lg bg-green-50 flex items-center justify-center"
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
