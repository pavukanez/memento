'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Room, PuzzlePiece } from '@/lib/supabase'
import { isPieceInCorrectPosition } from '@/lib/puzzle'

interface PuzzleBoardProps {
  room: Room
  pieces: PuzzlePiece[]
  onPieceUpdate: (pieceId: string, x: number, y: number, isPlaced: boolean) => void
}

export function PuzzleBoard({ room, pieces, onPieceUpdate }: PuzzleBoardProps) {
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const boardRef = useRef<HTMLDivElement>(null)

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
    if (!draggedPiece || !boardRef.current) return

    const boardRect = boardRef.current.getBoundingClientRect()
    const x = e.clientX - boardRect.left - dragOffset.x
    const y = e.clientY - boardRect.top - dragOffset.y

    // Check if piece is in correct position
    const isPlaced = isPieceInCorrectPosition({
      ...draggedPiece,
      currentX: x,
      currentY: y,
    })

    onPieceUpdate(draggedPiece.id, x, y, isPlaced)
  }, [draggedPiece, dragOffset, onPieceUpdate])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!draggedPiece || !boardRef.current) return

    e.preventDefault()
    const boardRect = boardRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - boardRect.left - dragOffset.x
    const y = touch.clientY - boardRect.top - dragOffset.y

    // Check if piece is in correct position
    const isPlaced = isPieceInCorrectPosition({
      ...draggedPiece,
      currentX: x,
      currentY: y,
    })

    onPieceUpdate(draggedPiece.id, x, y, isPlaced)
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

  const getPieceStyle = (piece: PuzzlePiece) => ({
    position: 'absolute' as const,
    left: piece.current_x,
    top: piece.current_y,
    width: 100,
    height: 100,
    backgroundImage: `url(${room.image_url})`,
    backgroundSize: `${room.puzzle_config.cols * 100}px ${room.puzzle_config.rows * 100}px`,
    backgroundPosition: `-${(piece.piece_index % room.puzzle_config.cols) * 100}px -${Math.floor(piece.piece_index / room.puzzle_config.cols) * 100}px`,
    border: piece.is_placed ? '2px solid #10b981' : '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: piece.is_placed ? 'default' : 'grab',
    zIndex: draggedPiece?.id === piece.id ? 1000 : 1,
    transform: `rotate(${piece.rotation}deg)`,
    transition: piece.is_placed ? 'all 0.3s ease' : 'none',
  })

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Puzzle Board</h2>
      
      <div
        ref={boardRef}
        className="relative bg-gray-50 rounded-lg overflow-hidden"
        style={{
          width: room.puzzle_config.cols * 100 + 20,
          height: room.puzzle_config.rows * 100 + 20,
          minHeight: '400px',
        }}
      >
        {/* Target positions (faded) */}
        {Array.from({ length: room.puzzle_config.rows * room.puzzle_config.cols }).map((_, index) => {
          const row = Math.floor(index / room.puzzle_config.cols)
          const col = index % room.puzzle_config.cols
          const piece = pieces.find(p => p.piece_index === index)
          
          return (
            <div
              key={`target-${index}`}
              className="absolute border-2 border-dashed border-gray-300 rounded-lg opacity-30"
              style={{
                left: col * 100 + 10,
                top: row * 100 + 10,
                width: 100,
                height: 100,
                backgroundImage: `url(${room.image_url})`,
                backgroundSize: `${room.puzzle_config.cols * 100}px ${room.puzzle_config.rows * 100}px`,
                backgroundPosition: `-${col * 100}px -${row * 100}px`,
              }}
            />
          )
        })}

        {/* Puzzle pieces */}
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className={`puzzle-piece ${piece.is_placed ? 'placed' : ''}`}
            style={getPieceStyle(piece)}
            onMouseDown={(e) => handleMouseDown(e, piece)}
            onTouchStart={(e) => handleTouchStart(e, piece)}
          />
        ))}
      </div>
    </div>
  )
}
