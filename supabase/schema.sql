-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for puzzle images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('puzzle-images', 'puzzle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for puzzle-images bucket
CREATE POLICY "Users can upload puzzle images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'puzzle-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view puzzle images" ON storage.objects
  FOR SELECT USING (bucket_id = 'puzzle-images');

CREATE POLICY "Users can delete their own puzzle images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'puzzle-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  puzzle_config JSONB NOT NULL DEFAULT '{"rows": 3, "cols": 4, "difficulty": "easy"}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create puzzle_pieces table
CREATE TABLE puzzle_pieces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  piece_index INTEGER NOT NULL,
  current_x FLOAT NOT NULL,
  current_y FLOAT NOT NULL,
  target_x FLOAT NOT NULL,
  target_y FLOAT NOT NULL,
  is_placed BOOLEAN DEFAULT FALSE,
  rotation FLOAT DEFAULT 0,
  last_moved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, piece_index)
);

-- Create room_members table for tracking who's in each room
CREATE TABLE room_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(room_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_rooms_created_by ON rooms(created_by);
CREATE INDEX idx_puzzle_pieces_room_id ON puzzle_pieces(room_id);
CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Users can view all rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" ON rooms
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms" ON rooms
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for puzzle_pieces
CREATE POLICY "Users can view puzzle pieces for rooms they're members of" ON puzzle_pieces
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM room_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update puzzle pieces for rooms they're members of" ON puzzle_pieces
  FOR UPDATE USING (
    room_id IN (
      SELECT room_id FROM room_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can insert puzzle pieces" ON puzzle_pieces
  FOR INSERT WITH CHECK (true);

-- RLS Policies for room_members
CREATE POLICY "Users can view room members for rooms they're in" ON room_members
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM room_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can join rooms" ON room_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" ON room_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_puzzle_pieces_updated_at BEFORE UPDATE ON puzzle_pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically add room creator as a member
CREATE OR REPLACE FUNCTION add_room_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO room_members (room_id, user_id, is_active)
  VALUES (NEW.id, NEW.created_by, true);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to add room creator as member
CREATE TRIGGER add_room_creator_as_member_trigger
  AFTER INSERT ON rooms
  FOR EACH ROW EXECUTE FUNCTION add_room_creator_as_member();
