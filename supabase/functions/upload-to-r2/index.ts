import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const roomName = formData.get('name') as string
    const difficulty = formData.get('difficulty') as 'easy' | 'medium' | 'hard'

    if (!file || !roomName) {
      return new Response(
        JSON.stringify({ error: 'Missing file or room name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'File must be an image' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Upload to R2 (this would need to be implemented with R2 SDK)
    // For now, we'll return a mock response
    const mockImageUrl = `https://example.com/uploaded/${Date.now()}.jpg`

    // Generate puzzle configuration
    const puzzleConfig = {
      rows: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 6,
      cols: difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8,
      difficulty
    }

    // Create room in database
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .insert({
        name: roomName,
        image_url: mockImageUrl,
        puzzle_config: puzzleConfig,
        created_by: user.id,
      })
      .select()
      .single()

    if (roomError) {
      throw roomError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        room: {
          id: room.id,
          name: room.name,
          image_url: room.image_url,
          puzzle_config: room.puzzle_config,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
