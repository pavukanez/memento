import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
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

    // Create server-side Supabase client with secret key
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

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

    // Generate unique path for Supabase Storage
    const fileExtension = file.name.split('.').pop()
    const path = `rooms/${session.user.id}/${Date.now()}.${fileExtension}`

    // Upload to Supabase Storage using server client
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('puzzle-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabaseServer.storage
      .from('puzzle-images')
      .getPublicUrl(uploadData.path)

    const imageUrl = publicUrl

    // Generate puzzle configuration
    const puzzleConfig = generatePuzzleConfig(difficulty || 'easy')
    const puzzlePieces = generatePuzzlePieces(puzzleConfig)

    // Create room in database using server client
    const { data: room, error: roomError } = await supabaseServer
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

    // Create puzzle pieces using server client
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

    const { error: piecesError } = await supabaseServer
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
