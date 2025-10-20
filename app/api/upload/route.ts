import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { uploadToR2 } from '@/lib/r2'
import { supabase } from '@/lib/supabase'
import { generatePuzzleConfig, generatePuzzlePieces } from '@/lib/puzzle'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabaseClient.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const roomName = formData.get('name') as string
    const difficulty = formData.get('difficulty') as 'easy' | 'medium' | 'hard'

    if (!file || !roomName) {
      return NextResponse.json({ error: 'Missing file or room name' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Generate unique key for R2
    const fileExtension = file.name.split('.').pop()
    const key = `rooms/${session.user.id}/${Date.now()}.${fileExtension}`

    // Upload to R2
    const imageUrl = await uploadToR2(file, key)

    // Generate puzzle configuration
    const puzzleConfig = generatePuzzleConfig(difficulty || 'easy')
    const puzzlePieces = generatePuzzlePieces(puzzleConfig)

    // Create room in database
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name: roomName,
        image_url: imageUrl,
        puzzle_config: puzzleConfig,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (roomError) {
      throw roomError
    }

    // Create puzzle pieces
    const piecesData = puzzlePieces.map(piece => ({
      room_id: room.id,
      piece_index: piece.pieceIndex,
      current_x: piece.currentX,
      current_y: piece.currentY,
      target_x: piece.targetX,
      target_y: piece.targetY,
      is_placed: piece.isPlaced,
      rotation: piece.rotation,
    }))

    const { error: piecesError } = await supabase
      .from('puzzle_pieces')
      .insert(piecesData)

    if (piecesError) {
      throw piecesError
    }

    return NextResponse.json({ 
      success: true, 
      room: {
        id: room.id,
        name: room.name,
        image_url: room.image_url,
        puzzle_config: room.puzzle_config,
      }
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
