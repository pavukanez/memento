import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Storage helper functions (for client-side use)
export async function deleteFromSupabaseStorage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('puzzle-images')
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

// Database types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  name: string
  image_url: string
  puzzle_config: {
    rows: number
    cols: number
    difficulty: 'easy' | 'medium' | 'hard'
  }
  created_by: string
  created_at: string
  updated_at: string
}

export interface PuzzlePiece {
  id: string
  room_id: string
  piece_index: number
  current_x: number
  current_y: number
  target_x: number
  target_y: number
  is_placed: boolean
  rotation: number
  last_moved_by: string
  created_at: string
  updated_at: string
}

export interface RoomMember {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  is_active: boolean
}
